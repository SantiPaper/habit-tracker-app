import { useQuery } from '@tanstack/react-query'

import { getImportanciaColors } from '../services/importancia-colors.service'

export const importanciaColorsQueryKey = ['importancia-colors'] as const

export function useImportanciaColors() {
    return useQuery({
        queryKey: importanciaColorsQueryKey,
        queryFn: getImportanciaColors
    })
}
