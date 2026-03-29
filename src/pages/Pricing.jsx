import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redirect /pricing to subscription plan detail (full compare lives on plan pages).
 */
function Pricing() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/plans/monthly', { replace: true });
  }, [navigate]);

  return null;
}

export default Pricing;
