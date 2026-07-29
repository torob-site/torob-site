"use client";

import {
  Camera,
  Search,
  History
} from "lucide-react";

import SearchBox, {
  Suggestion
} from "@/components/SearchBox";


export default function Hero() {


  return (

    <main className="mt-40 flex flex-col items-center justify-center px-6">


      <div className="mb-12 flex flex-col items-center">


        <img
          className="hidden dark:flex"
          src="/icons/logo-dark.svg"
        />

        <img
          className="flex dark:hidden"
          src="/icons/logo-light.svg"
        />


        <h1
          className="
          mt-3
          text-5xl
          font-black
          tracking-tight
          text-[#e91e33]
          dark:text-white
          "
        >
          ترب
        </h1>


      </div>





      <SearchBox>


        {
          ({
            query,
            setQuery,
            setIsDirty,
            open,
            setOpen,
            suggestions,
            isPending,
            fileInputRef,
            handleFileChange,
            selectSuggestion,
            handleKeyDown,
            selectedIndex,
            resetSelectedIndex,
            wrapperRef

          }) => (



            <div
              ref={wrapperRef}
              className="relative w-full max-w-md"
            >



              <div
                className="
              relative
              h-12
              w-full
              rounded-sm
              border
              border-gray-400
              bg-white
              dark:bg-[#212b36]
              "
              >



                <input


                  value={query}


                  onChange={(e) => {

                    setQuery(e.target.value);
                    setIsDirty(true);
                    setOpen(true);

                    resetSelectedIndex();

                  }}



                  onKeyDown={handleKeyDown}



                  placeholder="نام کالا یا فروشگاه را وارد کنید"



                  className="
                w-full
                h-full
                px-4
                pr-3
                pl-12
                outline-none
                bg-transparent
                dark:text-white
                "

                />






                <input

                  ref={fileInputRef}

                  type="file"

                  accept="image/*"

                  className="hidden"

                  onChange={handleFileChange}

                />





                <button

                  type="button"

                  onClick={() => fileInputRef.current?.click()}

                  className="
                absolute
                left-2
                top-1/2
                -translate-y-1/2
                text-slate-400
                "

                >

                  <Camera size={22} />


                </button>



              </div>







              {
                open && query && (

                  <div

                    className="
                  absolute
                  top-14
                  z-50
                  w-full
                  overflow-hidden
                  rounded-md
                  border
                  bg-white
                  shadow-lg
                  dark:border-slate-700
                  dark:bg-[#212b36]
                  "

                  >




                    {
                      isPending ? (


                        <div
                          className="
                        p-4
                        text-center
                        text-sm
                        text-slate-400
                        "
                        >

                          در حال جستجو...

                        </div>


                      )

                        :


                        suggestions.length === 0 ? (


                          <div
                            className="
                        p-4
                        text-center
                        text-sm
                        text-slate-400
                        "
                          >

                            نتیجه‌ای پیدا نشد

                          </div>


                        )

                          :


                          suggestions.map(
                            (
                              item: Suggestion,
                              index: number
                            ) => (



                              <button


                                key={index}


                                type="button"


                                onClick={() => selectSuggestion(item.text)}




                                className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        px-4
                        py-3
                        text-right

                        ${selectedIndex === index
                                    ?
                                    "bg-slate-100 dark:bg-slate-800"
                                    :
                                    "hover:bg-slate-100 dark:hover:bg-slate-800"
                                  }

                        `}


                              >




                                {
                                  item.type === "shop"

                                    ?

                                    <img

                                      src={item.logo}

                                      className="
                            h-8
                            w-8
                            rounded-full
                            object-cover
                            "

                                    />


                                    :


                                    item.is_history


                                      ?


                                      <History

                                        size={18}

                                        className="text-slate-400"

                                      />


                                      :


                                      <Search

                                        size={18}

                                        className="text-slate-400"

                                      />

                                }





                                <span
                                  className="
                          text-sm
                          dark:text-white
                          "
                                >

                                  {item.text}

                                </span>





                              </button>


                            ))


                    }





                  </div>


                )

              }




            </div>


          )

        }


      </SearchBox>






      <p
        className="
        mt-8
        text-center
        text-sm
        text-[#64748b]
        dark:text-[#94a3b8]
        "
      >

        مقایسه قیمت میلیون‌ها محصول بین هزاران فروشگاه

      </p>




    </main>

  );

}