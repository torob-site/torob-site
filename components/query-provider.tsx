"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

import axios from "axios";
import { useState } from "react";
import { authManager } from "@/components/auth-manager";


function handleAuthError(
  error: unknown,
  meta?: {
    authModal?: boolean;
  }
) {
  if (!axios.isAxiosError(error)) {
    return;
  }


  const status = error.response?.status;


  // فقط 401
  if (status !== 401) {
    return;
  }


  // این درخواست نباید Modal باز کند
  if (meta?.authModal === false) {
    return;
  }


  authManager.open();
}



function retryHandler(
  failureCount: number,
  error: unknown
) {

  if (axios.isAxiosError(error)) {

    const status = error.response?.status;


    // کاربر لاگین نیست
    if (status === 401) {
      return false;
    }


    // resource پیدا نشد
    if (status === 404) {
      return false;
    }


    // خطاهای validation و client
    if (
      status &&
      status >= 400 &&
      status < 500
    ) {
      return false;
    }

  }


  // خطاهای موقتی
  return failureCount < 2;
}



export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [client] = useState(
    () =>
      new QueryClient({

        queryCache: new QueryCache({

          onError(error, query) {

            handleAuthError(
              error,
              query.meta as {
                authModal?: boolean;
              }
            );

          },

        }),


        mutationCache: new MutationCache({

          onError(
            error,
            variables,
            context,
            mutation
          ) {

            handleAuthError(
              error,
              mutation.meta as {
                authModal?: boolean;
              }
            );

          },

        }),


        defaultOptions: {

          queries: {

            retry: retryHandler,

            refetchOnWindowFocus: false,

          },


          mutations: {

            retry: false,

          },

        },

      })
  );


  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}