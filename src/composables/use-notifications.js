import { useQuasar } from 'quasar';

const useNotifications = () => {
  const quasar = useQuasar();

  const notifyNegative = (message) => {
    quasar.notify({
      color: 'negative',
      message,
    });
  };

  const notifyPositive = (message) => {
    quasar.notify({
      color: 'positive',
      message,
    });
  };

  return { notifyNegative, notifyPositive };
};

export default useNotifications;
