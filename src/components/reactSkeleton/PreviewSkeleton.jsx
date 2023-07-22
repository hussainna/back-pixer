import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'


function PreviewSkeleton() {
  return (
    <div className="preview">
      <div className="flex">
        <div className="left">
          <Skeleton className='img' width={500} height={300}/>
          <Skeleton className='img' width={500} height={300}/>

        </div>
        <div className="right">
        <Skeleton className='img' width={500} height={300}/>
        <Skeleton className='img' width={500} height={300}/>

        </div>
      </div>
    </div>
  )
}

export default PreviewSkeleton