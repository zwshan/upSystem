import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import App from '@/App.vue'

describe('router shell', () => {
  it('shows dashboard view by default', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div>Dashboard</div>' } }],
    })

    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })
    expect(wrapper.text()).toContain('Dashboard')
  })
})
