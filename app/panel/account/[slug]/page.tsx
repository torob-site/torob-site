import { notFound } from "next/navigation";

import WorkingHours from "./WorkingHours";
import Address from "./Address";
import OwnerInfo from "./OwnerInfo";
import BusinessBackground from "./BusinessBackground";
import ShopPhoto from "./ShopPhoto";
import BusinessType from "./BusinessType";
import CustomerContact from "./CustomerContact";
import Profile from "./Profile";
import NationalCard from "./NationalCard";
import AddressProof from "./AddressProof";
import IdentityVideo from "./IdentityVideo";
import BusinessLicense from "./BusinessLicense";
import Instagram from "./Instagram";
import AccountDetailHeader from "./AccountDetailHeader";
import MyShops from "./MyShops";
import PermissionsPage from "./Permissions";

const accountComponents = {
    "working-hours": WorkingHours,
    address: Address,
    "owner-info": OwnerInfo,
    "business-background": BusinessBackground,
    "shop-photo": ShopPhoto,
    "business-type": BusinessType,
    "customer-contact": CustomerContact,
    "profile": Profile,
    "national-card": NationalCard,
    "address-proof": AddressProof,
    "identity-video": IdentityVideo,
    "business-license": BusinessLicense,
    "my-shops": MyShops,
    "permissions": PermissionsPage,
    instagram: Instagram,
} as const;

type AccountSlug = keyof typeof accountComponents;

interface AccountDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function AccountDetailPage({
    params,
}: AccountDetailPageProps) {
    const { slug } = await params;

    if (!(slug in accountComponents)) {
        notFound();
    }

    const Component =
        accountComponents[slug as AccountSlug];

    return (
        <div dir="rtl" className="min-h-screen w-full" > {/* Header مخصوص صفحات جزئیات Account */} <AccountDetailHeader slug={slug} /> {/* محتوای صفحه */} <main className="mx-auto w-full max-w-[700px]"> <Component /> </main> </div>
    );
}