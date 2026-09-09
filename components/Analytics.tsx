'use client';
import {useEffect} from 'react';
declare global { interface Window { dataLayer?: unknown[][]; } }
export default function Analytics(){useEffect(()=>{const id=process.env.NEXT_PUBLIC_GA_ID;if(!id)return;const s=document.createElement('script');s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${id}`;document.head.appendChild(s);window.dataLayer=window.dataLayer??[];function gtag(...args:unknown[]){window.dataLayer?.push(args)}gtag('js',new Date());gtag('config',id,{anonymize_ip:true});return()=>s.remove()},[]);return null}
