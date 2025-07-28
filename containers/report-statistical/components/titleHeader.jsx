import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom'
import Head from 'next/head'

const TitleHeader = ({ breadcrumbItems, title }) => {
  return (
    <div className="flex flex-col gap-1 h-fit">
      <Head>
        <title>{title}</title>
      </Head>
      <Breadcrumb items={breadcrumbItems} className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]" />
      <h2 className="text-title-section text-neutral-04 capitalize font-medium">{title}</h2>
    </div>
  )
}
export default TitleHeader
