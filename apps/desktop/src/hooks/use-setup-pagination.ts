import { useSettings } from "@/features/settings/context"
import { LOCAL_STORAGE } from "@/lib/constants"
import { PaginationState } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useLocalStorage } from "usehooks-ts"

/**
 * Sets up the state and memoization for page index & page size
 * to be used in paginating the rows.
 */
export const useSetupPagination = (connectionId: string) => {
  const settings = useSettings()
  const [paginationState] = useLocalStorage<PaginationState>(
    LOCAL_STORAGE.PAGINATION_STATE(connectionId),
    {
      pageIndex: 0,
      pageSize: settings.pageSize
    }
  )
  const [{ pageIndex, pageSize }, setPagination] = useState(paginationState)
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  )
  return { pagination, setPagination }
}
