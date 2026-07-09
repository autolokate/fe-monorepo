import { useCallback, useState } from 'react';

import { requestParkBystanderOtp, verifyParkBystanderOtp } from '@/services/scanner/index.js';

export function useParkOtp() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const requestOtp = useCallback(async (mobileDigits: string) => {
    setIsRequesting(true);
    try {
      return await requestParkBystanderOtp(mobileDigits);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const verifyOtp = useCallback(async (mobileDigits: string, code: string) => {
    setIsVerifying(true);
    try {
      return await verifyParkBystanderOtp(mobileDigits, code);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { requestOtp, verifyOtp, isRequesting, isVerifying };
}
