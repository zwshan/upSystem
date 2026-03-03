import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import Dashboard from '@/views/Dashboard.vue'

describe('Dashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders countdown and today review blocks', () => {
    const wrapper = mount(Dashboard, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    expect(wrapper.find("[data-testid='countdown-card']").exists()).toBe(true)
    expect(wrapper.find("[data-testid='today-review-card']").exists()).toBe(true)
  })
})
