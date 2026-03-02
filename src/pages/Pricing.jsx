import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirect /pricing to main page pricing section.
 * Full pricing table is on Landing (#pricing); LTD offer is at /ltd.
 */
function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/#pricing', { replace: true });
  }, [navigate]);

  return null;
}

export default Pricing;
