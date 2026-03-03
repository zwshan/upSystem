import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GridPaper from '@/components/exam/GridPaper.vue'

describe('GridPaper', () => {
  it('renders 25 x 24 cells', () => {
    const wrapper = mount(GridPaper, {
      props: {
        modelValue: '',
        wordLimit: 600,
      },
    })

    expect(wrapper.findAll("[data-testid='grid-cell']")).toHaveLength(600)
  })
})
