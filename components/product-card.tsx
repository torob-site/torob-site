"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";

import { useRef } from "react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { usePostUserFavorite } from "@/lib/apis";

interface ProductCardProps {
  product: any;
}


export default function ProductCard({
  product,
}: ProductCardProps) {


  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);


  const favoriteMutation = usePostUserFavorite();


  const images = product.productImages || [];

  const badges = product.badges || [];


  const toggleFavorite = () => {

    favoriteMutation.mutate({
      product_id: product.id,
    });

  };


  return (

    <div
      className="
      group/card
      dark:bg-[#212b36]
      w-52
      bg-white
      mt-10
      px-2.5
      py-2.5
      rounded-lg
      "
    >


      <div className="relative group/image">


        {
          images.length > 1 && (

            <div
              className="
              absolute
              top-0
              right-0
              z-40
              dark:bg-[#94a3b8]
              bg-[#64748b]
              flex
              items-center
              gap-1
              rounded-sm
              px-1
              py-0.5
              text-xs
              text-white
              "
            >

              <img
                className="w-3 h-3"
                src="https://assets.torob.com/public/main/images/camera.svg"
                alt=""
              />

              {images.length}

            </div>

          )
        }



        {
          product.is_authentic === true && (

            <Tooltip>

              <TooltipTrigger asChild>

                <button
                  type="button"
                  className="
                  absolute
                  top-10
                  right-0
                  z-50
                  flex
                  items-center
                  gap-1
                  rounded-l-lg
                  bg-[#eff6ff]
                  px-1
                  py-1
                  shadow-xs
                  shadow-blue-700
                  "
                >

                  <img
                    className="w-4 h-4"
                    src="https://assets.torob.com/public/main/images/authenticity_badge.svg"
                    alt=""
                  />

                  <span className="text-[#1e40af] text-xs font-bold">
                    اصل
                  </span>


                </button>

              </TooltipTrigger>


              <TooltipContent
                hideArrow
                side="bottom"
                className="
                bg-[#333]
                text-white
                mt-2
                mr-36
                text-xs
                font-bold
                "
              >
                تایید اصالت محصول توسط فروشندگان
              </TooltipContent>


            </Tooltip>

          )
        }





        {
          images.length > 1 ? (


            <Swiper

              modules={[Navigation]}

              loop

              onBeforeInit={(swiper) => {

                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;

                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;

              }}

            >

              {
                images.map((image: any, index: number) => (

                  <SwiperSlide key={index}>

                    <div className="flex justify-center">

                      <img
                        src={image.url}
                        className="
                        h-44
                        w-44
                        rounded-lg
                        object-contain
                        "
                        alt=""
                      />

                    </div>


                  </SwiperSlide>

                ))
              }



              <button
                ref={prevRef}
                className="
                absolute
                bottom-1
                left-8
                z-50
                hidden
                h-6
                w-6
                items-center
                justify-center
                rounded-r
                bg-[#33333380]
                text-white
                hover:bg-[#1E293B]
                group-hover/image:flex
                "
              >

                <ChevronRight size={17} />

              </button>



              <button
                ref={nextRef}
                className="
                absolute
                bottom-1
                left-2
                z-50
                hidden
                h-6
                w-6
                items-center
                justify-center
                rounded-l
                bg-[#33333380]
                text-white
                hover:bg-[#1E293B]
                group-hover/image:flex
                "
              >

                <ChevronLeft size={17} />

              </button>


            </Swiper>



          ) : (


            <div className="flex justify-center">

              <img

                src={images[0]?.url}

                className="
                h-44
                w-44
                rounded-lg
                object-contain
                "

                alt=""

              />

            </div>


          )

        }




        <div
          className="
          absolute
          bottom-1
          right-2
          z-50
          hidden
          group-hover/card:flex
          group/similar
          "
        >

          <button

            type="button"

            className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded
            bg-[#33333380]
            text-white
            hover:bg-[#1E293B]
            "

          >

            <img

              className="h-5 w-5"

              src="https://assets.torob.com/public/main/images/image_w.svg"

              alt=""

            />


          </button>


        </div>



      </div>





      <h1
        className="
        mt-4
        text-[15px]
        dark:text-[#f1f5f9]
        text-[#1e293b]
        line-clamp-2
        "
      >

        {product.name}

      </h1>





      {
        badges.length > 0 && (

          <div className="flex items-center mt-4">


            {
              badges.map((badge: any, index: number) => (

                <Badge

                  key={index}

                  variant="outline"

                  className="
                  text-[#1e293b]
                  dark:text-[#f1f5f9]
                  border-none
                  bg-[#f1f5f9]
                  dark:bg-[#15202b]
                  h-6
                  rounded-md
                  "

                >

                  {badge.text}

                </Badge>

              ))
            }


          </div>

        )
      }






      <p
        className="
        dark:text-[#f1f5f9]
        text-[#1e293b]
        font-bold
        text-sm
        mt-4
        "
      >

        {product.shop_price}

      </p>





      <div className="flex items-center justify-between mt-6">


        <p
          className="
          text-[12px]
          dark:text-[#94a3b8]
          text-[#64748b]
          whitespace-nowrap
          "
        >

          {product.shop_text}

        </p>





        <div className="flex items-center gap-3">


          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteMutation.isPending}
            className="
            cursor-pointer
            "
          >

            <div
              className={`
              w-4
              h-4
              ${product.is_favorite ? "like_fill" : "like"}
              `}
            />

          </button>




          <div
            className={`
            w-4
            h-4
            ${product.is_alert ? "bell_fill" : "bell"}
            `}
          />


        </div>


      </div>


    </div>

  );
}