import { describe, it, expect } from '@jest/globals'
import filterVariants, { VariantFilterState } from './filterVariants'
import { v2VariantFactory } from '../__factories__/Variant'

const baseFilter: VariantFilterState = {
  includeCategories: { lof: true, missense: true, synonymous: true, other: true },
  includeFilteredVariants: true,
  includeSNVs: true,
  includeIndels: true,
  includeExomes: true,
  includeGenomes: true,
  includeContext: false,
  includeClinvarOnly: false,
  searchText: '',
}

describe('filterVariants', () => {
  describe('includeClinvarOnly', () => {
    const clinvarVariant1 = Object.assign(v2VariantFactory.build({ variant_id: '1-100-A-C' }), {
      clinvar_variation_id: '111',
    })
    const clinvarVariant2 = Object.assign(v2VariantFactory.build({ variant_id: '1-200-G-T' }), {
      clinvar_variation_id: '222',
    })
    const nonClinvarVariant1 = v2VariantFactory.build({ variant_id: '1-300-A-T' })
    const nonClinvarVariant2 = v2VariantFactory.build({ variant_id: '1-400-C-G' })

    const mixedVariants = [clinvarVariant1, nonClinvarVariant1, clinvarVariant2, nonClinvarVariant2]

    it('does not filter variants when includeClinvarOnly is false', () => {
      const result = filterVariants(mixedVariants, { ...baseFilter, includeClinvarOnly: false }, [])
      expect(result).toHaveLength(4)
    })

    describe('when includeClinvarOnly is true', () => {
      it('returns only variants with a clinvar_variation_id', () => {
        const result = filterVariants(
          mixedVariants,
          { ...baseFilter, includeClinvarOnly: true },
          []
        )
        result.forEach((v) => expect((v as any).clinvar_variation_id).toBeTruthy())
      })

      it('excludes non-ClinVar variants', () => {
        const result = filterVariants(
          mixedVariants,
          { ...baseFilter, includeClinvarOnly: true },
          []
        )
        expect(result).not.toContain(nonClinvarVariant1)
        expect(result).not.toContain(nonClinvarVariant2)
      })

      it('includes all ClinVar variants present in gnomAD', () => {
        const result = filterVariants(
          mixedVariants,
          { ...baseFilter, includeClinvarOnly: true },
          []
        )
        const resultIds = result.map((v) => (v as any).clinvar_variation_id)
        expect(resultIds).toContain('111')
        expect(resultIds).toContain('222')
      })

      it('returns an empty list when no variants have a clinvar_variation_id', () => {
        const result = filterVariants(
          [nonClinvarVariant1, nonClinvarVariant2],
          { ...baseFilter, includeClinvarOnly: true },
          []
        )
        expect(result).toHaveLength(0)
      })
    })
  })
})
