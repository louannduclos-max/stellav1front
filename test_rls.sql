-- Setup
CREATE ROLE test_user;
CREATE TABLE test_table (id int, data text);
INSERT INTO test_table VALUES (1, 'secret');
ALTER TABLE test_table ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN TRUE;
END;
$$;

-- Grant access to table but not function yet
GRANT SELECT ON test_table TO test_user;

-- Policy using the function
CREATE POLICY test_policy ON test_table FOR SELECT TO test_user USING (public.check_access());

-- Test 1: No EXECUTE grant
SET ROLE test_user;
SELECT * FROM test_table;
RESET ROLE;

-- Test 2: Grant EXECUTE
GRANT EXECUTE ON FUNCTION public.check_access() TO test_user;
SET ROLE test_user;
SELECT * FROM test_table;
RESET ROLE;

-- Cleanup
DROP POLICY test_policy ON test_table;
DROP TABLE test_table;
DROP FUNCTION public.check_access();
DROP ROLE test_user;
