import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next';
import { useRouter } from 'next/router';
import type { NextPageWithLayout, Product, User } from '@/types';
import { motion } from 'framer-motion';
import Layout from '@/layouts/_layout';
import client from '@/data/client';
import Image from '@/components/ui/image';
import ProductSocialShare from '@/components/product/product-social-share';
import ProductInformation from '@/components/product/product-information';
import ProductDetailsPaper from '@/components/product/product-details-paper';
import { LongArrowIcon } from '@/components/icons/long-arrow-icon';
import { staggerTransition } from '@/lib/framer-motion/stagger-transition';
import routes from '@/config/routes';
import {
  fadeInBottom,
  fadeInBottomWithScaleX,
  fadeInBottomWithScaleY,
} from '@/lib/framer-motion/fade-in-bottom';
import placeholder from '@/assets/images/placeholders/product.svg';
import ProductReviews from '@/components/review/product-reviews';
import AverageRatings from '@/components/review/average-ratings';
import ProductQuestions from '@/components/questions/product-questions';
import isEmpty from 'lodash/isEmpty';
import invariant from 'tiny-invariant';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigValue } from '@/config';
import Cookies from 'js-cookie';
import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/endpoints';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import PreviewSkeleton from '@/components/reactSkeleton/PreviewSkeleton';
import { toast } from 'react-hot-toast';


// This function gets called at build time
type ParsedQueryParams = {
  productSlug: string;
};

export const getStaticPaths: GetStaticPaths<ParsedQueryParams> = async ({
  locales,
}) => {
  invariant(locales, 'locales is not defined');
  const { data } = await client.products.all({ limit: 100 });
  const paths = data?.flatMap((product) =>
    locales?.map((locale) => ({
      params: { productSlug: product.slug },
      locale,
    }))
  );
  return {
    paths,
    fallback: 'blocking',
  };
};

type PageProps = {
  product: Product;
};

export const getStaticProps: GetStaticProps<
  PageProps,
  ParsedQueryParams
> = async ({ params, locale }) => {
  const { productSlug } = params!; //* we know it's required because of getStaticPaths
  try {
    const product = await client.products.get({
      slug: productSlug,
      language: locale,
    });
    return {
      props: {
        product,
        ...(await serverSideTranslations(locale!, ['common'])),
      },
      revalidate: 60, // In seconds
    };
  } catch (error) {
    //* if we get here, the product doesn't exist or something else went wrong
    return {
      notFound: true,
    };
  }
};


function getPreviews(gallery: any[], image: any) {
  if (!isEmpty(gallery) && Array.isArray(gallery)) return gallery;
  if (!isEmpty(image)) return [image, {}];
  return [{}, {}];
}




const ProductPage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ product }) => {
  const { t } = useTranslation('common');
  const {
    id,
    name,
    slug,
    image,
    gallery,
    description,
    created_at,
    updated_at,
    ratings,
    rating_count,
    total_reviews,
    tags,
    type,
  } = product;
  const router = useRouter();
  const previews = getPreviews(gallery, image);


  
  



  const [Me,setMe]=useState({
    userId:''
  })

  const userId = useSelector(state => state.userId);


  const AUTH_TOKEN_KEY = ConfigValue.AUTH_TOKEN_KEY;


  const [isSubscribed,setSubscribed]=useState(false)
  const [Download,setDownload]=useState({
    number:''
  })

  const [Loading,setLoading]=useState(true)
  const today = new Date();

  const [Error,setError]=useState(false)

  const dispatch = useDispatch();
  const fetch=async ()=>{

      if(Cookies.get(AUTH_TOKEN_KEY)){


        await HttpClient.get<User>(API_ENDPOINTS.USERS_ME).then(res=>{
          Me.userId=res.id
        })
  
  
  
        HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/is-subscribed/${Me.userId}`).then(res=>{
          if(res.status===true){
           setSubscribed(true)  
              dispatch({ type: 'SET_DATA', payload: true });
              console.log('check data now',res)

           console.log('Download',Download)
          }
          else{
           setSubscribed(false)  
  
          }
        }).catch(error=>{
   
          console.log(error)
        })

        HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/subscriptions/${Me.userId}`).then(res=>{
          // console.log('subusbsub',res)
          Download.number=res.sumDownloads
          console.log('check sum',Download.number)
          dispatch({ type: 'SET_DOWNLOAD', payload: Download.number });
        })



        await HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/check-download-limit/${Me.userId}`).then(res=>{
          console.log('download limit data is here',res.date)
          setLoading(false)

          const numRows = res.date.length
          console.log('download number',Download.number)


          res.date.map((item,idx)=>{
            const lastSub=item.created_at[item.created_at.length - 1];
            const subs=new Date(item.created_at)
            const currentDate = today.toISOString().split('T')[0];
            const currentDownloadDateCheck=subs.toISOString().split('T')[0];
            // console.log('let see again',subs)
            if(currentDate===currentDownloadDateCheck)
            {

              console.log('check download',Download.number===numRows)
              if(Download.number<=numRows)
              {
                dispatch({ type: 'SET_DOWN_CHECK', payload: true });
                // setLoading(false)
                setError(true)


              }
              else if(Download.number>numRows)
              {
                dispatch({ type: 'SET_DOWN_CHECK', payload: null });
              }


            }

           
          })        
          

        })
  

      }

   }
  


   dispatch({ type: 'SET_DATA', payload: isSubscribed });
   const data = useSelector(state => state.data);

   useEffect(()=>{
    fetch()

    if(Cookies.get(AUTH_TOKEN_KEY)===undefined){
      setLoading(false)
    }

    if(Error===true)
    {
    toast.error(<b>Your downloads limit are finish today</b>)

    }

    console.log('token',Cookies.get(AUTH_TOKEN_KEY))
    console.log('redux come is here',data)
    // console.log('user id',userId)

    console.log(router)

 
  },[])





  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
    <div className="relative">
      <div className="h-full min-h-screen p-4 md:px-6 lg:px-8 lg:pt-6">
        <div className="sticky top-0 z-20 -mx-4 mb-1 -mt-2 flex items-center bg-light-300 p-4 dark:bg-dark-100 sm:static sm:top-auto sm:z-0 sm:m-0 sm:mb-4 sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
          <button
            onClick={() => router.push(routes?.home)}
            className="group inline-flex items-center gap-1.5 font-medium text-dark/70 hover:text-dark rtl:flex-row-reverse dark:text-light/70 hover:dark:text-light lg:mb-6"
          >
            <LongArrowIcon className="h-4 w-4" />
            {t('text-back')}
          </button>
        </div>
        {Loading?<PreviewSkeleton/>:<motion.div
          variants={staggerTransition()}
          className="grid gap-4 sm:grid-cols-2 lg:gap-6"
        >
          {previews?.map((img) => (
            <motion.div
              key={img.id}
              variants={fadeInBottomWithScaleX()}
              className="relative aspect-[3/2]"
            >
              <Image
                alt={name}
                fill
                quality={100}
                src={img?.original ?? placeholder}
                className="bg-light-500 object-cover dark:bg-dark-300"
              />
            </motion.div>
          ))}
        </motion.div>}
        
        
        <motion.div
          variants={fadeInBottom()}
          className="justify-center py-6 lg:flex lg:flex-col lg:py-10"
        >
          <ProductDetailsPaper product={product} className="lg:hidden" />
          <div className="lg:mx-auto 3xl:max-w-[1200px]">
            <div className="w-full rtl:space-x-reverse lg:flex lg:space-x-14 lg:pb-3 xl:space-x-20 3xl:space-x-28">
              <div className="hidden lg:block 3xl:max-w-[600px]">
                <div className="pb-5 leading-[1.9em] dark:text-light-600">
                  {Loading?<Skeleton count={4} width={600}/>:description}
                </div>
                 {Loading?
                 
                 <div className="flex-skeleton">
                  <Skeleton count={1} width={150} className=''/>
                  <Skeleton className='social item' width={50} height={50} />
                  <Skeleton className='social item' width={50} height={50}/>
                  <Skeleton className='social item' width={50} height={50}/>
                  <Skeleton className='button item' height={50} width={100}/>
                 </div>
                 
                 :
                 
                 <ProductSocialShare
                 productSlug={slug}
                 className="border-t border-light-500 pt-5 dark:border-dark-400 md:pt-7"
               />
                 }
              </div>
              {Loading?
              
              <div className="flex-skeleton">
                <div className="left">
                  <div className="left-items">
                  <Skeleton width={20}/>
                  <Skeleton width={50}/>
                  </div>
                  <div className="left-items">
                  <Skeleton width={20}/>
                  <Skeleton width={50}/>
                  </div>
                  <div className="left-items">
                  <Skeleton width={20}/>
                  <Skeleton width={50}/>
                  </div>
                  <div className="left-items">
                  <Skeleton width={20}/>
                  <Skeleton width={50}/>
                  </div>

                </div>
                <div className="right">
                  <Skeleton width={60} count={3}/>
                  
                </div>
              </div>

              :
              <ProductInformation
              tags={tags}
              created_at={created_at}
              updated_at={updated_at}
              layoutType={type.name}
              //@ts-ignore
              icon={type?.icon}
              className="flex-shrink-0 pb-6 pt-2.5 lg:min-w-[350px] lg:max-w-[470px] lg:pb-0"
            />
              }
            </div>
            {Loading?'':
            
            <div className="mt-4 w-full md:mt-8 md:space-y-10 lg:mt-12 lg:flex lg:flex-col lg:space-y-12">
              <AverageRatings
                ratingCount={rating_count}
                totalReviews={total_reviews}
                ratings={ratings}
              />
              <ProductReviews productId={id} />
              <ProductQuestions
                productId={product?.id}
                shopId={product?.shop?.id}
              />
            </div>

            }
          </div>

          <ProductSocialShare
            productSlug={slug}
            className="border-t border-light-500 pt-5 dark:border-dark-400 md:pt-7 lg:hidden"
          />
        </motion.div>
      </div>
      <motion.div
        variants={fadeInBottomWithScaleY()}
        className="sticky bottom-0 right-0 z-10 hidden h-[100px] w-full border-t border-light-500 bg-light-100 px-8 py-5 dark:border-dark-400 dark:bg-dark-200 lg:flex 3xl:h-[120px]"
      >

        {Loading?
        <div className="bottom-preview">
          <div className="flex">
            <div className="left ">
              <Skeleton width={400} height={30}/>
              <div className="flex-left flex">
              <div className="left-bottom flex text-center">
                <Skeleton className='img mr-2' width={20} height={10}/>
                <Skeleton className='' width={90}/>
              </div>
              <div className="left-bottom flex text-center">
                <Skeleton className='img mr-2' width={20} height={10}/>
                <Skeleton className='' width={90}/>
              </div>
              <div className="left-bottom flex text-center">
                <Skeleton className='img mr-2' width={20} height={10}/>
                <Skeleton className='' width={90}/>
              </div>
              </div>
            </div>
            <div className="right ml-[20%]">
              <div className="flex">
                <Skeleton width={200} height={40} className=' rounded mr-6'/>
                <Skeleton width={200} height={40} className='rounded'/>
              </div>
            </div>
          </div>
        </div>
        :
        <ProductDetailsPaper product={product} />
        
        }

      </motion.div>
    </div>
    </SkeletonTheme>
  );
};

ProductPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ProductPage;