import ShopLayoutClient from "./ShopLayoutClient"

type Props = {
  children: React.ReactNode
  params: Promise<{ id: string; slug: string }>
}

export default async function ShopLayout({ children, params }: Props) {
  const { id, slug } = await params
  return (
    <ShopLayoutClient shopId={Number(id)} slug={slug}>
      {children}
    </ShopLayoutClient>
  )
}