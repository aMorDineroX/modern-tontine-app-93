-- Script pour corriger les problèmes de base de données

-- 1. Corriger la fonction has_role
CREATE OR REPLACE FUNCTION has_role(role TEXT) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Vérifier et corriger les politiques RLS pour les tables inaccessibles

-- Politiques pour tontine_groups
DROP POLICY IF EXISTS "Users can view their groups" ON tontine_groups;
CREATE POLICY "Users can view their groups" ON tontine_groups 
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = tontine_groups.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create groups" ON tontine_groups 
FOR INSERT WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "Group admins can update groups" ON tontine_groups 
FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_id = tontine_groups.id AND user_id = auth.uid() AND role = 'admin')
);

-- Politiques pour group_members
DROP POLICY IF EXISTS "Users can view their group memberships" ON group_members;
CREATE POLICY "Users can view their group memberships" ON group_members 
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = group_members.group_id AND created_by = auth.uid())
);

CREATE POLICY "Group admins can manage members" ON group_members 
FOR ALL USING (
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = group_members.group_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin')
);

-- Politiques pour contributions
DROP POLICY IF EXISTS "Users can view their contributions" ON contributions;
CREATE POLICY "Users can view their contributions" ON contributions 
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = contributions.group_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = contributions.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can manage their own contributions" ON contributions 
FOR ALL USING (
  user_id = auth.uid()
);

CREATE POLICY "Group admins can manage all contributions" ON contributions 
FOR ALL USING (
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = contributions.group_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = contributions.group_id AND user_id = auth.uid() AND role = 'admin')
);

-- Politiques pour payouts
DROP POLICY IF EXISTS "Users can view their payouts" ON payouts;
CREATE POLICY "Users can view their payouts" ON payouts 
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = payouts.group_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = payouts.group_id AND user_id = auth.uid())
);

CREATE POLICY "Group admins can manage payouts" ON payouts 
FOR ALL USING (
  EXISTS (SELECT 1 FROM tontine_groups WHERE id = payouts.group_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = payouts.group_id AND user_id = auth.uid() AND role = 'admin')
);

-- Politiques pour messages
DROP POLICY IF EXISTS "Users can view group messages" ON messages;
CREATE POLICY "Users can view group messages" ON messages 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can send messages to their groups" ON messages 
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

-- 3. Corriger la politique RLS pour profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- 4. Créer un utilisateur de test si nécessaire
-- Note: Cette partie doit être exécutée manuellement via l'interface Supabase
-- ou via l'API d'authentification
