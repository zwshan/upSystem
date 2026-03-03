import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import ExamSimulation from '@/views/ExamSimulation.vue'

describe('ExamSimulation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts a session and enters first question', async () => {
    const wrapper = mount(ExamSimulation, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.find("[data-testid='start-exam-btn']").trigger('click')
    expect(wrapper.find("[data-testid='answer-sheet-entry']").exists()).toBe(true)
  })
})
