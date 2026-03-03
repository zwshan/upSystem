import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import ReviewCenter from '@/views/ReviewCenter.vue'

describe('ReviewCenter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders review summary panel', () => {
    const wrapper = mount(ReviewCenter, {
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.find("[data-testid='review-center-summary']").exists()).toBe(true)
  })
})
