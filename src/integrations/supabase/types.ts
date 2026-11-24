// =============================
// CUSTOS — newsystem.costs
// =============================
export type CostRow = {
  id: string
  code: string
  product: string | null
  mark: string | null
  ncm: string | null
  current_cost: number | null
  previous_cost: number | null
  packaging_cost: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type CostInsert = {
  id?: string
  code: string
  product?: string | null
  mark?: string | null
  ncm?: string | null
  current_cost?: number | null
  previous_cost?: number | null
  packaging_cost?: number | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type CostUpdate = Partial<{
  code: string
  product: string | null
  mark: string | null
  ncm: string | null
  current_cost: number | null
  previous_cost: number | null
  packaging_cost: number | null
  updated_at: string
  deleted_at: string | null
}>

// =============================
// PRECIFICAÇÃO — newsystem.pricing_rules
// =============================
export type PricingRuleRow = {
  id: string
  rule_type: string
  scope: string
  scope_value: string
  cost_id: string | null
  rate: number
  active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export type PricingRuleInsert = {
  id?: string
  rule_type: string
  scope: string
  scope_value: string
  cost_id?: string | null
  rate: number
  active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export type PricingRuleUpdate = Partial<{
  rule_type: string
  scope: string
  scope_value: string
  cost_id: string | null
  rate: number
  active: boolean | null
  updated_at: string | null
}>
