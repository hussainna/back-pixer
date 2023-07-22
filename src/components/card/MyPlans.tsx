import { Fragment, useEffect, useState } from 'react';
import { useModalAction } from '@/components/modal-views/context';
import { Transition } from '@/components/ui/transition';
import { useDefaultPaymentMethod } from '@/data/card';
import { Menu } from '@/components/ui/dropdown';
import amex from '@/assets/cards/amex.svg';
import diners from '@/assets/cards/diners.svg';
import discover from '@/assets/cards/discover.svg';
import jcb from '@/assets/cards/jcb.svg';
import mastercard from '@/assets/cards/mastercard.svg';
import unionpay from '@/assets/cards/unionpay.svg';
import visa from '@/assets/cards/visa.svg';
import Image from '@/components/ui/image';
import { Table } from '@/components/ui/table';
import { useIsRTL } from '@/lib/locals';
import CheckIconWithBg from '@/components/icons/check-icon-with-bg';
import { useTranslation } from 'next-i18next';
import Fallback from '@/assets/cards/fallback-image.png';
import { HttpClient } from '@/data/client/http-client';
import { User } from '@/types';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import TableLoader from '../ui/loader/table-loader';

let images = {
  amex,
  visa,
  diners,
  jcb,
  mastercard,
  unionpay,
  discover,
} as any;

interface CardViewProps {
  view?: 'modal' | 'normal';
  payments: any;
  showContinuePayment?: boolean;
}

const CardsView = ({
  view = 'normal',
  payments = [],
  showContinuePayment = false,
}: CardViewProps) => {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const { createDefaultPaymentMethod, isLoading: cardLoading } =
    useDefaultPaymentMethod();

  function deleteCard(id: string) {
    openModal('DELETE_CARD_MODAL', {
      card_id: id,
    });
  }

  const makeDefaultCard = async (id: string) => {
    await createDefaultPaymentMethod({
      method_id: id,
    });
  };
  const [Me,setMe]=useState({
    userId:''
  })

  const [Subscribed,setSubscribed]=useState([])
  const [Loading,setLoading]=useState(true)
  const [Rows,setRows]=useState({
    number:'',
    remind:''
  })

  useEffect(()=>{
    HttpClient.get<User>(API_ENDPOINTS.USERS_ME).then(res=>{
        Me.userId=res.id

        HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/check-download-limit/${Me.userId}`).then(res=>{
            Rows.number=res.date.length
            console.log('rows',Rows.number)
          })


          HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/subscriptions/${Me.userId}`).then(res=>{
            setSubscribed(res.data)
            console.log('subscribed',Subscribed)

            setLoading(false)

        })


        HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/subscriptions/${Me.userId}`).then(res=>{
          // console.log('subusbsub',res)
          Rows.remind=res.sumDownloads
          console.log('sum',Rows.remind)
        })


      })
      console.log(Me.userId)

    

  },[])

  const { alignLeft, alignRight } = useIsRTL();
  const columns: any = [
    {
      title: ' ',
      dataIndex: '',
      key: '',
      width: 50,
      align: alignLeft,
      render: (record: any) => {
        return record?.default_card ? (
          <div className="w-9 text-brand">
            <CheckIconWithBg className="h-5 w-5" />
          </div>
        ) : (
          ''
        );
      },
    },
    {
      title: <span>ID</span>,
      dataIndex: 'network',
      key: 'network',
      width: 120,
      align: alignLeft,
      render: (network: string) => {
        return (
          <div className="w-11">
            {network ? (
              <Image
                src={images[network]}
                width={44}
                height={30}
                layout="responsive"
                alt={t('text-company')}
              />
            ) : (
              <Image
                src={Fallback}
                width={40}
                height={28}
                layout="responsive"
                alt={t('text-company')}
              />
            )}
          </div>
        );
      },
    },
    {
      title: <span>Subscribed Type</span>,
      dataIndex: 'last4',
      key: 'last4',
      align: alignLeft,
      width: 170,
      render: (last4: number) => {
        return <p className="truncate">{`**** **** **** ${last4}`}</p>;
      },
    },
    {
      title: <span>Expired Date</span>,
      dataIndex: 'owner_name',
      key: 'owner_name',
      align: alignLeft,
      width: 150,
      render: (owner_name: string) => {
        return <p className="truncate">{owner_name}</p>;
      },
    },
    {
      title: <span>Downloads</span>,
      dataIndex: 'expires',
      key: 'expires',
      align: alignLeft,
      width: 180,
      render: (expires: string) => {
        return <p className="truncate">{expires}</p>;
      },
    },
    {
        title: <span>Plan Start</span>,
        dataIndex: 'expires',
        key: 'expires',
        align: alignLeft,
        width: 180,
        render: (expires: string) => {
          return <p className="truncate">{expires}</p>;
        },
      },
    {
      title: ' ',
      dataIndex: '',
      align: alignRight,
      width: 50,
      render: (card: any) => {
        return (
          <div className="relative flex items-center justify-end">
            <Menu>
              <Menu.Button className="relative inline-flex h-8 items-center justify-center space-x-1">
                <span className="inline-flex h-1 w-1 shrink-0 rounded-full bg-dark-700 dark:bg-light-800"></span>
                <span className="inline-flex h-1 w-1 shrink-0 rounded-full bg-dark-700 dark:bg-light-800"></span>
                <span className="inline-flex h-1 w-1 shrink-0 rounded-full bg-dark-700 dark:bg-light-800"></span>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute top-[84%] z-30 mt-4 w-56 rounded-md bg-light py-1.5  text-dark shadow-dropdown ltr:right-0 ltr:origin-top-right rtl:left-0 rtl:origin-top-left dark:bg-dark-400 dark:text-light">
                  {!card.default_card && (
                    <Menu.Item>
                      <button
                        type="button"
                        className="transition-fill-colors w-full px-5 py-2.5 font-medium hover:bg-light-400 ltr:text-left rtl:text-right dark:hover:bg-dark-600"
                        onClick={() => makeDefaultCard(card?.id)}
                      >
                        {t('text-default-text')}
                      </button>
                    </Menu.Item>
                  )}

                  <Menu.Item>
                    <button
                      type="button"
                      className="transition-fill-colors w-full px-5 py-2.5 font-medium text-[#DF4B4B] hover:bg-light-400 ltr:text-left rtl:text-right dark:hover:bg-dark-600"
                      onClick={() => deleteCard(card?.id)}
                    >
                      {t('text-delete-card')}
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        );
      },
    },
  ];


    if (Loading) {
        return (
          <div className="flex w-full flex-col">
            <div className="mb-8 flex items-center justify-center">
              <h1 className="text-heading text-center text-base font-semibold">
                My Plans
              </h1>
            </div>
    
            <TableLoader uniqueKey={`table-loader`} />
          </div>
        );
      }

  return (
    
    // <Table
    //   //@ts-ignore
    //   columns={columns}
    //   data={Subscribed}
    //   className="card-view-table w-full shadow-none"
    //   scroll={{ x: 800 }}
    //   rowClassName={(record, i) =>
    //     record?.default_card ? 'row-highlight' : ''
    //   }
    //   emptyText={t('text-no-card-found')}
    //   rowKey="card-view"
    // />


    <div className="flex flex-col">
      <h2 className=' text-white text-[15px] font-semibold'>{t('text-downloads-reminds')}(8)</h2>
  <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
      <div className="overflow-hidden">
        <table className="min-w-full text-left text-sm font-light">
          <thead className="border-2 border-[#3e3e3e] font-medium p-10 bg-[#323232]">
            <tr>
              <th scope="col" className="px-6 py-4">#</th>
              <th scope="col" className="px-6 py-4">{t('text-subscribed-type')}</th>
              <th scope="col" className="px-6 py-4">{t('text-expired-date')}</th>
              <th scope="col" className="px-6 py-4">{t('text-downloads')}</th>
              <th scope="col" className="px-6 py-4">{t('text-plan-start')}</th>
              <th scope="col" className="px-6 py-4">{t('text-Plan-id')}</th>

            </tr>
          </thead>
          <tbody className='border-2 border-[#3e3e3e]'>
   
              {Subscribed.map((item,idx)=>(
                <tr key={idx} className=" bg-[#252525]">
                <td className="whitespace-nowrap px-6 py-4 font-medium">{item.id}</td>
                <td className="whitespace-nowrap px-6 py-4">{item.subscription_type}</td>
                <td className="whitespace-nowrap px-6 py-4">{item.expiration_date}</td>
                <td className="whitespace-nowrap px-6 py-4">{item.downloads}</td>
                <td className="whitespace-nowrap px-6 py-4">{item.created_at}</td>
                <td className="whitespace-nowrap px-6 py-4">{item.id_plan}</td>

              </tr>
              ))}
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  );
};

export default CardsView;
