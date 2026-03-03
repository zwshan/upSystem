import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppShell from '@/components/layout/AppShell.vue'

describe('AppShell', () => {
  it('renders 9 primary nav entries', () => {
    const wrapper = mount(AppShell)
    expect(wrapper.findAll("[data-testid='primary-nav-item']")).toHaveLength(9)
  })
})
