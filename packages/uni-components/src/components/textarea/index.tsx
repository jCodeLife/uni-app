import { defineComponent, Ref, ref, computed, watch } from 'vue'
import {
  props as fieldProps,
  emit as fieldEmit,
  useField,
} from '../../helpers/useField'
import ResizeSensor from '../resize-sensor/index'

const props = /*#__PURE__*/ Object.assign({}, fieldProps, {
  placeholderClass: {
    type: String,
    default: 'input-placeholder',
  },
  autoHeight: {
    type: [Boolean, String],
    default: false,
  },
  confirmType: {
    type: String,
    default: '',
  },
})

export default /*#__PURE__*/ defineComponent({
  name: 'Textarea',
  props,
  emit: ['confirm', 'linechange', ...fieldEmit],
  setup(props, { emit }) {
    const rootRef: Ref<HTMLElement | null> = ref(null)
    const { fieldRef, state, scopedAttrsState, fixDisabledColor, trigger } =
      useField(props, rootRef, emit)
    const valueCompute = computed(() => state.value.split('\n'))
    const isDone = computed(() =>
      ['done', 'go', 'next', 'search', 'send'].includes(props.confirmType)
    )
    const heightRef = ref(0)
    const lineRef: Ref<HTMLElement | null> = ref(null)
    watch(
      () => heightRef.value,
      (height) => {
        const el = rootRef.value as HTMLElement
        const lineEl = lineRef.value as HTMLElement
        let lineHeight = parseFloat(getComputedStyle(el).lineHeight)
        if (isNaN(lineHeight)) {
          lineHeight = lineEl.offsetHeight
        }
        var lineCount = Math.round(height / lineHeight)
        trigger('linechange', {} as Event, {
          height,
          heightRpx: (750 / window.innerWidth) * height,
          lineCount,
        })
        if (props.autoHeight) {
          el.style.height = height + 'px'
        }
      }
    )

    function onResize({ height }: { height: number }) {
      heightRef.value = height
    }

    function confirm(event: Event) {
      trigger('confirm', event, {
        value: state.value,
      })
    }

    function onKeyDownEnter(event: Event) {
      if ((event as KeyboardEvent).key !== 'Enter') {
        return
      }
      if (isDone.value) {
        event.preventDefault()
      }
    }

    function onKeyUpEnter(event: Event) {
      if ((event as KeyboardEvent).key !== 'Enter') {
        return
      }
      if (isDone.value) {
        confirm(event)
        const textarea = event.target as HTMLTextAreaElement
        textarea.blur()
      }
    }

    // iOS 13 以下版本需要修正边距
    const DARK_TEST_STRING = '(prefers-color-scheme: dark)'
    const fixMargin =
      String(navigator.platform).indexOf('iP') === 0 &&
      String(navigator.vendor).indexOf('Apple') === 0 &&
      window.matchMedia(DARK_TEST_STRING).media !== DARK_TEST_STRING

    return () => {
      let textareaNode =
        props.disabled && fixDisabledColor ? (
          <textarea
            ref={fieldRef}
            value={state.value}
            tabindex="-1"
            readonly={!!props.disabled}
            maxlength={state.maxlength}
            class={{
              'uni-textarea-textarea': true,
              'uni-textarea-textarea-fix-margin': fixMargin,
            }}
            style={{ overflowY: props.autoHeight ? 'hidden' : 'auto' }}
            // fix: 禁止 readonly 状态获取焦点
            onFocus={(event: Event) =>
              (event.target as HTMLInputElement).blur()
            }
          />
        ) : (
          <textarea
            ref={fieldRef}
            value={state.value}
            disabled={!!props.disabled}
            maxlength={state.maxlength}
            enterkeyhint={props.confirmType}
            class={{
              'uni-textarea-textarea': true,
              'uni-textarea-textarea-fix-margin': fixMargin,
            }}
            style={{ overflowY: props.autoHeight ? 'hidden' : 'auto' }}
            onKeydown={onKeyDownEnter}
            onKeyup={onKeyUpEnter}
          />
        )
      return (
        <uni-textarea ref={rootRef}>
          <div class="uni-textarea-wrapper">
            <div
              v-show={!state.value.length}
              {...scopedAttrsState.attrs}
              style={props.placeholderStyle}
              class={['uni-textarea-placeholder', props.placeholderClass]}
            >
              {props.placeholder}
            </div>
            <div ref={lineRef} class="uni-textarea-line">
              {' '}
            </div>
            <div class="uni-textarea-compute">
              {valueCompute.value.map((item) => (
                <div>{item.trim() ? item : '.'}</div>
              ))}
              <ResizeSensor initial onResize={onResize} />
            </div>
            {props.confirmType === 'search' ? (
              <form action="" onSubmit={() => false} class="uni-input-form">
                {textareaNode}
              </form>
            ) : (
              textareaNode
            )}
          </div>
        </uni-textarea>
      )
    }
  },
})