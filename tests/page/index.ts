import { definePage, ref } from '../../src'

definePage({
  props: {
    query1: String,
    query2: String,
    query3: String,
  },
  setup(props, ctx) {
    const text = ref('text')
    const tap = () => {
      text.value = text.value === 'taped' ? 'text' : 'taped'
    }
    return {
      text,
      tap,
    }
  },
})
