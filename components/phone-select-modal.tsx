"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type PhoneModalProps = {
  open: boolean;

  onClose: () => void;

  phones: string[];

  selected?: string;

  onSelect: (phone: string) => void;

  onAddPhone: () => void;
};

export default function PhoneSelectModal({
  open,

  onClose,

  phones,

  selected,

  onSelect,

  onAddPhone,
}: PhoneModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent
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

[&>button]:hidden

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

        <div className="space-y-3 mt-5">
          {phones.map((phone) => (
            <button
              key={phone}
              onClick={() => {
                onSelect(phone);

                onClose();
              }}
              className="
w-full
h-14
border
rounded-lg
px-4
flex
items-center
justify-between
"
            >
              <span>{phone}</span>

              <span
                className={`
w-5
h-5
rounded-full
border

${selected === phone ? "border-blue-500" : ""}

`}
              />
            </button>
          ))}

          <button
            onClick={() => {
              onClose();

              onAddPhone();
            }}
            className="
w-full
h-14
border
rounded-lg
flex
items-center
justify-end
gap-2
px-4
"
          >
            ثبت شماره تماس جدید
            <Plus className="text-blue-600" />
          </button>
        </div>

        <Button
          className="
mt-5
w-full
h-12
bg-blue-600
"
        >
          تایید
        </Button>
      </DialogContent>
    </Dialog>
  );
}
