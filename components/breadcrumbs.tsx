"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Fragment } from "react"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      <Link 
        href="/" 
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-white font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
