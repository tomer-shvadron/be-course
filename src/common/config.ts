export const config = {
  API: {
    PORT: 21494,
    HOST: 'localhost',
    MAX_LENGTH: 10 * 1024 * 1024, // 10MB
    MAX_DISK_QUOTA: 1 * 1024 * 1024 * 1024, // 1GB
    MAX_HEADER_LENGTH: 50,
    MAX_HEADER_COUNT: 20,
    MAX_ID_LENGTH: 200,
    MAX_BLOBS_IN_FOLDER: 100,
  },
  LOAD_BALANCER: {
    PORT: 4000,
    HOST: 'localhost',
    REGISTRATION_DURATION_SECONDS: 20,
  },
};
