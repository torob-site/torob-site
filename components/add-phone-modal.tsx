"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddPhoneModal({ open, onClose }: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
      showCloseButton={false}
        className="
fixed
bottom-0
top-auto
left-1/2
-translate-x-1/2
translate-y-0

w-full
max-w-[700px]

rounded-t-3xl
p-5

sm:max-w-[700px]
"
      >
        <div
          className="
flex
justify-end
"
        >
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <h2
          className="
text-center
font-bold
mt-3
text-xl
"
        >
          شماره تماس جدید
        </h2>

        <label
          className="
block
text-right
text-sm
font-medium
mt-8
"
        >
          شماره تلفن ثابت / همراه
        </label>

        <input
          className="
w-full
h-12
border
rounded-lg
mt-2
px-3
outline-none
focus:ring-2
focus:ring-blue-400
"
        />

        <Button
          className="
w-full
h-12
mt-5
bg-blue-600
"
        >
          ثبت
        </Button>
      </DialogContent>
    </Dialog>
  );
}
