-- Migration pour mettre à jour les politiques de sécurité RLS (Row Level Security)

-- Fonctions utilitaires pour les vérifications de sécurité
-- Fonction pour vérifier si l'utilisateur est administrateur d'un groupe
CREATE OR REPLACE FUNCTION is_group_admin(group_id INTEGER) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = $1 AND user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est membre d'un groupe
CREATE OR REPLACE FUNCTION is_group_member(group_id INTEGER) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = $1 AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION has_role(role TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est un administrateur système
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer les politiques existantes pour les recréer
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their groups" ON tontine_groups;

-- Politiques pour la table profiles
CREATE POLICY "Users can view all profiles" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Politiques pour la table tontine_groups
CREATE POLICY "Users can view their groups" 
ON tontine_groups FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = tontine_groups.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create groups" 
ON tontine_groups FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
ON tontine_groups FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  is_group_admin(id)
);

CREATE POLICY "Group admins can delete groups" 
ON tontine_groups FOR DELETE 
USING (
  auth.uid() = created_by OR 
  is_group_admin(id)
);

-- Politiques pour la table group_members
CREATE POLICY "Users can view members of their groups" 
ON group_members FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_members.group_id AND user_id = auth.uid())
);

CREATE POLICY "Group admins can insert members" 
ON group_members FOR INSERT 
WITH CHECK (
  (user_id = auth.uid()) OR
  is_group_admin(group_id)
);

CREATE POLICY "Group admins can update members" 
ON group_members FOR UPDATE 
USING (
  is_group_admin(group_id) OR 
  (user_id = auth.uid() AND role != 'admin')
);

CREATE POLICY "Group admins can delete members" 
ON group_members FOR DELETE 
USING (
  is_group_admin(group_id) OR 
  (user_id = auth.uid())
);

-- Politiques pour la table contributions
CREATE POLICY "Users can view contributions of their groups" 
ON contributions FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = contributions.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert own contributions" 
ON contributions FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = contributions.group_id AND user_id = auth.uid())
);

CREATE POLICY "Group admins can update contributions" 
ON contributions FOR UPDATE 
USING (
  is_group_admin(group_id) OR 
  (user_id = auth.uid() AND status = 'pending')
);

CREATE POLICY "Group admins can delete contributions" 
ON contributions FOR DELETE 
USING (
  is_group_admin(group_id)
);

-- Politiques pour la table payouts
CREATE POLICY "Users can view payouts of their groups" 
ON payouts FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = payouts.group_id AND user_id = auth.uid())
);

CREATE POLICY "Group admins can insert payouts" 
ON payouts FOR INSERT 
WITH CHECK (
  is_group_admin(group_id)
);

CREATE POLICY "Group admins can update payouts" 
ON payouts FOR UPDATE 
USING (
  is_group_admin(group_id)
);

CREATE POLICY "Group admins can delete payouts" 
ON payouts FOR DELETE 
USING (
  is_group_admin(group_id)
);

-- Politiques pour la table services
CREATE POLICY "Anyone can view active services" 
ON services FOR SELECT 
USING (
  is_active = true OR is_admin()
);

CREATE POLICY "Admins can manage services" 
ON services FOR ALL 
USING (
  is_admin()
);

-- Politiques pour la table user_services
CREATE POLICY "Users can view own services" 
ON user_services FOR SELECT 
USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "Users can subscribe to services" 
ON user_services FOR INSERT 
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own services" 
ON user_services FOR UPDATE 
USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "Admins can delete services" 
ON user_services FOR DELETE 
USING (
  user_id = auth.uid() OR is_admin()
);

-- Politiques pour la table messages
CREATE POLICY "Group members can view messages" 
ON messages FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

CREATE POLICY "Group members can send messages" 
ON messages FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = messages.group_id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can update own messages" 
ON messages FOR UPDATE 
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own messages or admins can delete any" 
ON messages FOR DELETE 
USING (
  user_id = auth.uid() OR is_group_admin(group_id)
);

-- Politiques pour la table notifications
CREATE POLICY "Users can view own notifications" 
ON notifications FOR SELECT 
USING (
  user_id = auth.uid()
);

CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own notifications" 
ON notifications FOR DELETE 
USING (
  user_id = auth.uid()
);

-- Politiques pour la table user_points
CREATE POLICY "Users can view own points" 
ON user_points FOR SELECT 
USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "System can manage points" 
ON user_points FOR ALL 
USING (
  is_admin()
);

-- Politiques pour la table achievements
CREATE POLICY "Anyone can view achievements" 
ON achievements FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage achievements" 
ON achievements FOR ALL 
USING (
  is_admin()
);

-- Politiques pour la table user_achievements
CREATE POLICY "Users can view own achievements" 
ON user_achievements FOR SELECT 
USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "System can manage user achievements" 
ON user_achievements FOR ALL 
USING (
  is_admin()
);

-- Politiques pour la table promo_codes
CREATE POLICY "Anyone can view active promo codes" 
ON promo_codes FOR SELECT 
USING (
  is_active = true AND valid_from <= NOW() AND valid_to >= NOW() AND (max_uses IS NULL OR current_uses < max_uses)
);

CREATE POLICY "Admins can manage promo codes" 
ON promo_codes FOR ALL 
USING (
  is_admin()
);

-- Politiques pour la table user_roles
CREATE POLICY "Users can view own roles" 
ON user_roles FOR SELECT 
USING (
  user_id = auth.uid() OR is_admin()
);

CREATE POLICY "Admins can manage roles" 
ON user_roles FOR ALL 
USING (
  is_admin()
);

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Politiques de sécurité RLS mises à jour avec succès';
END $$;
