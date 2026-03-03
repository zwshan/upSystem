import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import AnswerSheet from '@/views/AnswerSheet.vue'

describe('AnswerSheet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows answer sheet workspace', () => {
    const wrapper = mount(AnswerSheet, {
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.find("[data-testid='answer-sheet-entry']").exists()).toBe(true)
  })
})
