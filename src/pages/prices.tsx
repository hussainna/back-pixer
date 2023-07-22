import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import type { CreateContactUsInput, NextPageWithLayout, User } from '@/types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import GeneralLayout from '@/layouts/_general-layout';
import Seo from '@/layouts/_seo';
import client from '@/data/client';
import routes from '@/config/routes';
import { useSettings } from '@/data/settings';
// import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
import AddToCart from '@/components/cart/add-to-cart';
import { useCart } from '@/components/cart/lib/cart.context';
import usePrice from '@/lib/hooks/use-price';
import { generateCartItem } from '@/components/cart/lib/generate-cart-item';
// import { cartReducer, State, initialState } from './cart.reducer';
import { cartReducer, State, initialState } from '@/components/cart/lib/cart.reducer';
import { useLocalStorage } from 'react-use';
import { CART_KEY } from '@/lib/constants';
import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/endpoints';


const Prices: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  const { settings } = useSettings();
  const { contactDetails } = settings ?? {};
  let [reset, setReset] = useState<CreateContactUsInput | null>(null);
  const { mutate } = useMutation(client.settings.contactUs, {
    onSuccess: () => {
      toast.success('Successfully sent your message');
      setReset({
        name: '',
        email: '',
        subject: '',
        description: '',
      });
    },
    onError: (res) => {
      toast.error('Ops! something went wrong');
      console.log(res);
    },
  });




  const [Price,setPrice]=useState([])
  const [PriceTow,setPriceTow]=useState([])
  const [isSub,setIsSub]=useState(false)
  const [Features,setFeatures]=useState([])
  const { items, clearItemFromCart, verifiedResponse } = useCart();


  const [Plan,setPlan]=useState({
    id:'',
    id_plan:'',
    name:'',
    slug:'plan',
    shop:'hussain',
    orders_count:'asdasd',
    total_downloads:'5',
    preview_url:'/',
    price:'',
    sale_price:'',
    plan:'plan',
    language:'',
    img:'',
    plan_limit:''
  })
  const [Subscribed,setSubscribed]=useState({
    SubscribedType:[]
  })


  const [Me,setMe]=useState({
    userId:''
  })


  useEffect(()=>{

     HttpClient.get<User>(API_ENDPOINTS.USERS_ME).then(res=>{
      Me.userId=res.id
    })

    axios.get(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/plans?status=only_active`).then(res=>{
      setPrice(res.data.data)
      setPriceTow(res.data.data)

      console.log('res items',res.data.data)
      console.log('price item',res)

    })
    axios.get(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/plans/features/list`).then(res=>{
      setFeatures(res.data.data)
      console.log('Features items',Features)
    })



    

    console.log('here cart',items.length)
    console.log('look',Subscribed)

  },[])
  const router=useRouter()
  const addToCart=(id,e)=>{
    e.preventDefault()
    console.log(id)
    axios.get(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/plans/edit/${id}?language=en`).then(res=>{
      Plan.id=res.data.id_product
      Plan.name=res.data.name
      Plan.id_plan=res.data.id
      Plan.slug=res.data.name
      Plan.shop=res.data.name
      Plan.price=res.data.price
      Plan.sale_price=res.data.price
      Plan.language=router.locale
      Plan.plan_limit=res.data.plan_limit
      console.log('plans',Plan)
      handleAddToCart()
    })
  }


//========== add to cart=================



const { addItemToCart, updateCartLanguage, language, isInStock } = useCart();
const [addToCartLoader, setAddToCartLoader] = useState(false);
const [cartingSuccess, setCartingSuccess] = useState(false);
// const { price } = usePrice({
//   amount: item?.sale_price ? item?.sale_price : item?.price,
//   baseAmount: item?.price,
// });

const [savedCart, saveCart] = useLocalStorage(
  CART_KEY,
  JSON.stringify(initialState)
);
const [state, dispatch] = React.useReducer(
  cartReducer,
  JSON.parse(savedCart!)
);



function handleAddToCart() {
  setAddToCartLoader(true);

  HttpClient.get<User>(`${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/check-cart/${Plan.id_plan}/${Me.userId}`).then(res=>{
    if(res.status===false)
    {
      toast.error(<b>{res.message}</b>)
    }
    else
    {

        if(items.length>0){
      // alert('you cannot add plan if there items in cart')
      const confirm=window.confirm('there plan in cart you must delete one')
  
      if(confirm){
      clearItemFromCart(items.length=0)
      }
    }
    else{
  
      setTimeout(() => {
        setAddToCartLoader(false);
        
    
        // console.log(item.price)
       if(!Plan.price){
        console.log('something err happen')
       }
       else{
        if (Plan?.language !== language) {
          updateCartLanguage(Plan?.language);
        }
        setCartingSuccess(true);
        addItemToCart(generateCartItem(Plan), 1);
        toast.success(<b>{t('text-add-to-cart-message')}</b>);
        setTimeout(() => {
          setCartingSuccess(false);
        }, 800);
        
        
       }
    
    
      }, 650);
  
    }

    }
  })

     
   




}





//====================================










  
  return (
    <>
      <Seo
        title="Contact us"
        description="Fastest digital download template built with React, NextJS, TypeScript, React-Query and Tailwind CSS."
        url={routes.contact}
      />
      <div className="price">
        <div className="title">
          <h2 className='text-dark dark:text-white'>{t('choose-plane')}</h2>
          <p className='text-[#6C6C6C] '>{t('price-top-description')}</p>
        </div>
        <div className="row">

        

 

        
      
           {Price.map(({
            id,
            name,
            selected_features,
            description,
            price,
            id_plan_feature,
            id_product,
            language
           })=>
            {
              if(language===router.locale)
              {
                return(
                  <div key={id} className={t('choose-plane')==='CHOOSE YOUR PLAN'?'col border-2 dark:border-[#212121]   bg-[#ffffff] border-[#fffff] dark:hover:border-[#ffffff] dark:bg-[#212121] ':'col border-2 dark:border-[#212121]   bg-[#ffffff] border-[#fffff] dark:hover:border-[#ffffff] dark:bg-[#212121] colAR'}>
                <div className='img-top bg-white hover:border-2 hover:border-white dark:bg-[#181818] '>
                   <img src="/Diamond.png" alt="" />
                </div>
                <div className="card-body">
                <h4 className='dark:text-white text-dark'>{name}</h4>
                 <p>{description}</p>
                <div className="price-items">
                 <span className='dark:text-white text-dark-100'>$</span>
      
                  <h5 className='dark:text-white text-dark'>{parseInt(price)}</h5>
              <div className="price-right">
                  <span className='dark:text-white text-dark-100'>.00</span>
                    <label className='time'>for month</label>
                  </div>
              </div>
              
              <button onClick={(e)=>addToCart(id,e)} >
              <button className='bg-[#fff] rounded-2xl text-5 px-7 py-4 dark:hover:text-[#000] dark:hover:bg-[#C6C6C6] text-[#474747] dark:text-[#fff] dark:bg-[#181818]'>Add to cart</button> 
              </button> 
              
             {selected_features.map((item,idx)=>(
                <ul className="icons" key={idx}>
    
                 <li>
                 {/* <span className='dark:text-white text-dark'>{item.feature.name}</span><i className='check'><img src="/Group 1.svg" alt="" /></i> */}
                  {item.feature===null?null:<div className='flex items-center'><i className='check'><img src="/Group 1.svg" alt="" /></i> <span className='dark:text-white text-dark'>{item.feature.name}</span> </div>}
                  </li>
                </ul>
              ))} 
    
         
            </div>
          </div>
                )
              }
            }
          )}  

       
        </div>
      </div>
    </>
  );
};

Prices.getLayout = function getLayout(page) {
  return <GeneralLayout>{page}</GeneralLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
    },
    revalidate: 60, // In seconds
  };
};

export default Prices;
