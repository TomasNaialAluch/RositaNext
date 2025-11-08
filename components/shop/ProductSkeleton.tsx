'use client'

export default function ProductSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="product-card-skeleton-image" />
      <div className="product-card-skeleton-content">
        <div className="product-card-skeleton-title" />
        <div className="product-card-skeleton-description" />
        <div className="product-card-skeleton-footer">
          <div className="product-card-skeleton-price" />
          <div className="product-card-skeleton-button" />
        </div>
      </div>
    </div>
  )
}

