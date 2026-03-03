import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import QuestionManager from '@/views/QuestionManager.vue'

describe('QuestionManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('filters by category', async () => {
    const wrapper = mount(QuestionManager, {
      global: {
        plugins: [createPinia()],
      },
    })

    await wrapper.find("[data-testid='category-filter']").setValue('案例分析')
    expect(wrapper.findAll("[data-testid='question-row']").length).toBeGreaterThan(0)
  })
})
