import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {  } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactConfetti from 'react-confetti';
import type { NextPageWithLayout } from '@/types';
import GeneralLayout from '@/layouts/_general-layout';
import Button from '@/components/ui/button';
import { useWindowSize } from '@/lib/hooks/use-window-size';
import { useCart } from '@/components/cart/lib/cart.context';
import routes from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { dehydrate, QueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import client from '@/data/client';
import type { SettingsQueryOptions } from '@/types';

const Order: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { width, height } = useWindowSize();
  const { resetCart } = useCart();
  useEffect(() => {
    resetCart();
  }, [resetCart]);
  return (
    <div className="m-auto flex flex-grow flex-col items-center justify-center px-5">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-light shadow-card dark:bg-dark-400 md:h-[120px] md:w-[120px] 3xl:h-32 3xl:w-32">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-brand-dark md:h-16 md:w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mb-2.5 text-15px font-semibold text-dark-300 dark:text-light md:text-base 3xl:text-lg">
        {t('text-order-received-title')}
      </h2>
      <p className="text-center">{t('text-order-thank-you-message')}</p>
      <Button
        variant="solid"
        className="mt-5 sm:mt-6 md:mt-8"
        onClick={() => router.push(routes.purchases)}
      >
        {t('text-order-button-title')}
      </Button>
      <ReactConfetti width={width} height={height} />
    </div>
  );
};

Order.authorization = true;
Order.getLayout = function getLayout(page) {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.SETTINGS, { language: locale }],
    ({ queryKey }) => client.settings.all(queryKey[1] as SettingsQueryOptions)
  );

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Order;
