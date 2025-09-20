export const Geolocation = {
  getCurrentPosition: async (_opts?: any) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
    }
    throw new Error('Geolocation not available');
  },
};

export default Geolocation;
