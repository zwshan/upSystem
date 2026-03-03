import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import Statistics from '@/views/Statistics.vue'

describe('Statistics', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders weekly trend chart container', () => {
    const wrapper = mount(Statistics, {
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.find("[data-testid='weekly-trend-chart']").exists()).toBe(true)
  })
})
