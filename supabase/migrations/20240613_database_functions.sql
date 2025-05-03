-- Migration pour ajouter des fonctions de base de données utiles

-- Fonction pour obtenir les statistiques d'un groupe
CREATE OR REPLACE FUNCTION get_group_stats(p_group_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'group_id', p_group_id,
    'name', g.name,
    'member_count', (SELECT COUNT(*) FROM group_members WHERE group_id = p_group_id),
    'active_member_count', (SELECT COUNT(*) FROM group_members WHERE group_id = p_group_id AND status = 'active'),
    'total_contributions', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id),
    'paid_contributions', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND status = 'paid'),
    'pending_contributions', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND status = 'pending'),
    'missed_contributions', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND status = 'missed'),
    'total_contribution_amount', (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE group_id = p_group_id AND status = 'paid'),
    'total_payout_amount', (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE group_id = p_group_id AND status IN ('paid', 'pending')),
    'next_payout', (
      SELECT json_build_object(
        'user_id', p.user_id,
        'amount', p.amount,
        'date', p.payout_date,
        'status', p.status
      )
      FROM payouts p
      WHERE p.group_id = p_group_id AND p.status = 'scheduled'
      ORDER BY p.payout_date ASC
      LIMIT 1
    ),
    'created_at', g.created_at,
    'updated_at', g.updated_at
  ) INTO v_result
  FROM tontine_groups g
  WHERE g.id = p_group_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', p_user_id,
    'full_name', p.full_name,
    'group_count', (SELECT COUNT(*) FROM group_members WHERE user_id = p_user_id),
    'active_group_count', (SELECT COUNT(*) FROM group_members WHERE user_id = p_user_id AND status = 'active'),
    'total_contributions', (SELECT COUNT(*) FROM contributions WHERE user_id = p_user_id),
    'paid_contributions', (SELECT COUNT(*) FROM contributions WHERE user_id = p_user_id AND status = 'paid'),
    'pending_contributions', (SELECT COUNT(*) FROM contributions WHERE user_id = p_user_id AND status = 'pending'),
    'missed_contributions', (SELECT COUNT(*) FROM contributions WHERE user_id = p_user_id AND status = 'missed'),
    'total_contribution_amount', (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE user_id = p_user_id AND status = 'paid'),
    'total_payout_amount', (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE user_id = p_user_id AND status IN ('paid', 'pending')),
    'next_contribution', (
      SELECT json_build_object(
        'group_id', c.group_id,
        'amount', c.amount,
        'date', c.payment_date,
        'status', c.status
      )
      FROM contributions c
      WHERE c.user_id = p_user_id AND c.status = 'pending' AND c.payment_date > NOW()
      ORDER BY c.payment_date ASC
      LIMIT 1
    ),
    'next_payout', (
      SELECT json_build_object(
        'group_id', p.group_id,
        'amount', p.amount,
        'date', p.payout_date,
        'status', p.status
      )
      FROM payouts p
      WHERE p.user_id = p_user_id AND p.status = 'scheduled'
      ORDER BY p.payout_date ASC
      LIMIT 1
    ),
    'points', (SELECT points FROM user_points WHERE user_id = p_user_id),
    'achievement_count', (SELECT COUNT(*) FROM user_achievements WHERE user_id = p_user_id),
    'has_premium', (
      SELECT EXISTS (
        SELECT 1 FROM user_services us
        JOIN services s ON us.service_id = s.id
        WHERE us.user_id = p_user_id AND us.status = 'active' AND us.end_date > NOW()
      )
    ),
    'joined_at', p.created_at
  ) INTO v_result
  FROM profiles p
  WHERE p.id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les membres d'un groupe avec leurs statistiques
CREATE OR REPLACE FUNCTION get_group_members_with_stats(p_group_id INTEGER)
RETURNS SETOF JSON AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'user_id', gm.user_id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'role', gm.role,
    'status', gm.status,
    'joined_at', gm.joined_at,
    'contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND user_id = gm.user_id),
    'paid_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND user_id = gm.user_id AND status = 'paid'),
    'pending_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND user_id = gm.user_id AND status = 'pending'),
    'missed_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = p_group_id AND user_id = gm.user_id AND status = 'missed'),
    'total_contribution_amount', (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE group_id = p_group_id AND user_id = gm.user_id AND status = 'paid'),
    'total_payout_amount', (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE group_id = p_group_id AND user_id = gm.user_id AND status IN ('paid', 'pending')),
    'next_contribution', (
      SELECT json_build_object(
        'amount', c.amount,
        'date', c.payment_date,
        'status', c.status
      )
      FROM contributions c
      WHERE c.group_id = p_group_id AND c.user_id = gm.user_id AND c.status = 'pending' AND c.payment_date > NOW()
      ORDER BY c.payment_date ASC
      LIMIT 1
    ),
    'next_payout', (
      SELECT json_build_object(
        'amount', p.amount,
        'date', p.payout_date,
        'status', p.status
      )
      FROM payouts p
      WHERE p.group_id = p_group_id AND p.user_id = gm.user_id AND p.status = 'scheduled'
      ORDER BY p.payout_date ASC
      LIMIT 1
    )
  )
  FROM group_members gm
  JOIN profiles p ON gm.user_id = p.id
  WHERE gm.group_id = p_group_id
  ORDER BY gm.role, gm.joined_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les groupes d'un utilisateur avec leurs statistiques
CREATE OR REPLACE FUNCTION get_user_groups_with_stats(p_user_id UUID)
RETURNS SETOF JSON AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'group_id', g.id,
    'name', g.name,
    'contribution_amount', g.contribution_amount,
    'frequency', g.frequency,
    'start_date', g.start_date,
    'payout_method', g.payout_method,
    'created_by', g.created_by,
    'created_at', g.created_at,
    'member_count', (SELECT COUNT(*) FROM group_members WHERE group_id = g.id),
    'active_member_count', (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'active'),
    'user_role', gm.role,
    'user_status', gm.status,
    'user_joined_at', gm.joined_at,
    'user_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = g.id AND user_id = p_user_id),
    'user_paid_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = g.id AND user_id = p_user_id AND status = 'paid'),
    'user_pending_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = g.id AND user_id = p_user_id AND status = 'pending'),
    'user_missed_contribution_count', (SELECT COUNT(*) FROM contributions WHERE group_id = g.id AND user_id = p_user_id AND status = 'missed'),
    'user_total_contribution_amount', (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE group_id = g.id AND user_id = p_user_id AND status = 'paid'),
    'user_total_payout_amount', (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE group_id = g.id AND user_id = p_user_id AND status IN ('paid', 'pending')),
    'user_next_contribution', (
      SELECT json_build_object(
        'amount', c.amount,
        'date', c.payment_date,
        'status', c.status
      )
      FROM contributions c
      WHERE c.group_id = g.id AND c.user_id = p_user_id AND c.status = 'pending' AND c.payment_date > NOW()
      ORDER BY c.payment_date ASC
      LIMIT 1
    ),
    'user_next_payout', (
      SELECT json_build_object(
        'amount', p.amount,
        'date', p.payout_date,
        'status', p.status
      )
      FROM payouts p
      WHERE p.group_id = g.id AND p.user_id = p_user_id AND p.status = 'scheduled'
      ORDER BY p.payout_date ASC
      LIMIT 1
    )
  )
  FROM tontine_groups g
  JOIN group_members gm ON g.id = gm.group_id
  WHERE gm.user_id = p_user_id
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un nouveau groupe et ajouter le créateur comme membre admin
CREATE OR REPLACE FUNCTION create_group_with_admin(
  p_name TEXT,
  p_contribution_amount DECIMAL,
  p_frequency frequency,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_payout_method payout_method
)
RETURNS JSON AS $$
DECLARE
  v_group_id INTEGER;
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Insérer le nouveau groupe
  INSERT INTO tontine_groups (
    name,
    contribution_amount,
    frequency,
    start_date,
    payout_method,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    p_name,
    p_contribution_amount,
    p_frequency,
    p_start_date,
    p_payout_method,
    v_user_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_group_id;
  
  -- Ajouter le créateur comme membre admin
  INSERT INTO group_members (
    group_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    v_group_id,
    v_user_id,
    'admin',
    'active',
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Retourner les informations du groupe créé
  RETURN json_build_object(
    'group_id', v_group_id,
    'name', p_name,
    'contribution_amount', p_contribution_amount,
    'frequency', p_frequency,
    'start_date', p_start_date,
    'payout_method', p_payout_method,
    'created_by', v_user_id,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter un membre à un groupe
CREATE OR REPLACE FUNCTION add_group_member(
  p_group_id INTEGER,
  p_user_id UUID,
  p_role user_role DEFAULT 'member',
  p_status member_status DEFAULT 'pending'
)
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est admin du groupe
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = p_group_id AND user_id = v_current_user_id AND role = 'admin'
  ) INTO v_is_admin;
  
  -- Si l'utilisateur n'est pas admin et essaie d'ajouter quelqu'un d'autre, erreur
  IF NOT v_is_admin AND v_current_user_id != p_user_id THEN
    RAISE EXCEPTION 'Seuls les administrateurs du groupe peuvent ajouter d''autres membres';
  END IF;
  
  -- Si l'utilisateur n'est pas admin et essaie de s'ajouter comme admin, erreur
  IF NOT v_is_admin AND p_role = 'admin' THEN
    RAISE EXCEPTION 'Vous ne pouvez pas vous ajouter comme administrateur';
  END IF;
  
  -- Ajouter le membre au groupe
  INSERT INTO group_members (
    group_id,
    user_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    p_user_id,
    p_role,
    p_status,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (group_id, user_id) DO UPDATE
  SET role = p_role,
      status = p_status,
      updated_at = NOW();
  
  -- Retourner les informations du membre ajouté
  RETURN json_build_object(
    'group_id', p_group_id,
    'user_id', p_user_id,
    'role', p_role,
    'status', p_status,
    'joined_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une contribution
CREATE OR REPLACE FUNCTION create_contribution(
  p_group_id INTEGER,
  p_amount DECIMAL,
  p_status contribution_status DEFAULT 'pending',
  p_payment_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_contribution_id INTEGER;
  v_actual_payment_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est membre du groupe
  IF NOT EXISTS (SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Vous n''êtes pas membre de ce groupe';
  END IF;
  
  -- Utiliser la date fournie ou la date actuelle
  v_actual_payment_date := COALESCE(p_payment_date, NOW());
  
  -- Insérer la contribution
  INSERT INTO contributions (
    group_id,
    user_id,
    amount,
    status,
    payment_date,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    v_user_id,
    p_amount,
    p_status,
    v_actual_payment_date,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_contribution_id;
  
  -- Si la contribution est payée, mettre à jour les points de l'utilisateur
  IF p_status = 'paid' THEN
    -- Ajouter des points pour la contribution
    UPDATE user_points
    SET points = points + 5,
        total_earned = total_earned + 5,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    -- Créer une notification
    INSERT INTO notifications (
      user_id,
      title,
      message,
      is_read,
      type,
      link,
      created_at
    )
    VALUES (
      v_user_id,
      'Contribution effectuée',
      format('Votre contribution de %s€ pour le groupe a été enregistrée.', p_amount),
      false,
      'success',
      format('/groups/%s', p_group_id),
      NOW()
    );
  END IF;
  
  -- Retourner les informations de la contribution
  RETURN json_build_object(
    'contribution_id', v_contribution_id,
    'group_id', p_group_id,
    'user_id', v_user_id,
    'amount', p_amount,
    'status', p_status,
    'payment_date', v_actual_payment_date,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un paiement
CREATE OR REPLACE FUNCTION create_payout(
  p_group_id INTEGER,
  p_user_id UUID,
  p_amount DECIMAL,
  p_status payout_status DEFAULT 'scheduled',
  p_payout_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID;
  v_payout_id INTEGER;
  v_actual_payout_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est admin du groupe
  IF NOT EXISTS (SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = v_current_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les administrateurs du groupe peuvent créer des paiements';
  END IF;
  
  -- Vérifier que le destinataire est membre du groupe
  IF NOT EXISTS (SELECT 1 FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Le destinataire n''est pas membre de ce groupe';
  END IF;
  
  -- Utiliser la date fournie ou la date actuelle
  v_actual_payout_date := COALESCE(p_payout_date, NOW());
  
  -- Insérer le paiement
  INSERT INTO payouts (
    group_id,
    user_id,
    amount,
    status,
    payout_date,
    created_at,
    updated_at
  )
  VALUES (
    p_group_id,
    p_user_id,
    p_amount,
    p_status,
    v_actual_payout_date,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_payout_id;
  
  -- Créer une notification pour le destinataire
  INSERT INTO notifications (
    user_id,
    title,
    message,
    is_read,
    type,
    link,
    created_at
  )
  VALUES (
    p_user_id,
    CASE
      WHEN p_status = 'paid' THEN 'Paiement reçu'
      WHEN p_status = 'pending' THEN 'Paiement en attente'
      ELSE 'Paiement programmé'
    END,
    format('Un paiement de %s€ a été %s pour vous.', 
           p_amount, 
           CASE
             WHEN p_status = 'paid' THEN 'effectué'
             WHEN p_status = 'pending' THEN 'initié'
             ELSE 'programmé'
           END),
    false,
    CASE
      WHEN p_status = 'paid' THEN 'success'
      WHEN p_status = 'pending' THEN 'info'
      ELSE 'info'
    END,
    format('/groups/%s', p_group_id),
    NOW()
  );
  
  -- Retourner les informations du paiement
  RETURN json_build_object(
    'payout_id', v_payout_id,
    'group_id', p_group_id,
    'user_id', p_user_id,
    'amount', p_amount,
    'status', p_status,
    'payout_date', v_actual_payout_date,
    'created_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques globales de l'application
CREATE OR REPLACE FUNCTION get_app_stats()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'user_count', (SELECT COUNT(*) FROM profiles),
    'group_count', (SELECT COUNT(*) FROM tontine_groups),
    'active_group_count', (
      SELECT COUNT(DISTINCT group_id) 
      FROM group_members 
      WHERE status = 'active'
    ),
    'contribution_count', (SELECT COUNT(*) FROM contributions),
    'paid_contribution_count', (SELECT COUNT(*) FROM contributions WHERE status = 'paid'),
    'total_contribution_amount', (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE status = 'paid'),
    'payout_count', (SELECT COUNT(*) FROM payouts),
    'paid_payout_count', (SELECT COUNT(*) FROM payouts WHERE status = 'paid'),
    'total_payout_amount', (SELECT COALESCE(SUM(amount), 0) FROM payouts WHERE status = 'paid'),
    'premium_user_count', (
      SELECT COUNT(DISTINCT user_id) 
      FROM user_services 
      WHERE status = 'active' AND end_date > NOW()
    ),
    'message_count', (SELECT COUNT(*) FROM messages),
    'achievement_count', (SELECT COUNT(*) FROM user_achievements)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des groupes
CREATE OR REPLACE FUNCTION search_groups(p_search_term TEXT)
RETURNS SETOF tontine_groups AS $$
BEGIN
  RETURN QUERY
  SELECT g.*
  FROM tontine_groups g
  JOIN group_members gm ON g.id = gm.group_id
  WHERE 
    gm.user_id = auth.uid() AND
    (
      g.name ILIKE '%' || p_search_term || '%' OR
      g.id::TEXT = p_search_term
    )
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rechercher des utilisateurs
CREATE OR REPLACE FUNCTION search_users(p_search_term TEXT)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE 
    p.full_name ILIKE '%' || p_search_term || '%' OR
    p.id::TEXT = p_search_term
  ORDER BY p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour mettre à jour la date de dernière activité dans user_points
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_points
  SET last_activity = NOW(),
      updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les déclencheurs
DROP TRIGGER IF EXISTS update_last_activity_on_contribution ON contributions;
CREATE TRIGGER update_last_activity_on_contribution
AFTER INSERT OR UPDATE ON contributions
FOR EACH ROW
EXECUTE FUNCTION update_last_activity();

DROP TRIGGER IF EXISTS update_last_activity_on_message ON messages;
CREATE TRIGGER update_last_activity_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_activity();

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonctions de base de données ajoutées avec succès';
END $$;
