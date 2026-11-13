<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from '../api'
import { notify, refreshTasks, refreshStats, store } from '../store'
import { fmtSize } from '../store'
import type { RemoteFile } from '@shared/types'

const props = defineProps<{ files: RemoteFile[] }>()
const emit = defineEmits<{ close: [] }>()

const checked = ref(new Set<string>())
const expanded = ref(new Set<string>())

const checkedFileCount = computed(() => {
  const all = collect(props.files)
  let n = 0
  for (const p of checked.value) {
    const f = all.find(x => x.path === p)
    if (f && !f.isDir) n++
    if (f && f.isDir) n += countFiles(f)
  }
  return n
})

function collect(files: RemoteFile[], out: RemoteFile[] = []): RemoteFile[] {
  for (const f of files) { out.push(f); if (f.children) collect(f.children, out) }
  return out
}
function countFiles(d: RemoteFile): number {
  return (d.children ?? []).reduce((n, c) => n + (c.isDir ? countFiles(c) : 1), 0)
}
function dirSize(d: RemoteFile): number {
  return (d.children ?? []).reduce((n, c) => n + (c.isDir ? dirSize(c) : c.size), 0)
}

function toggle(f: RemoteFile): void {
  if (checked.value.has(f.path)) checked.value.delete(f.path)
  else checked.value.add(f.path)
  checked.value = new Set(checked.value)
}
function toggleDir(f: RemoteFile): void {
  expanded.value.has(f.path) ? expanded.value.delete(f.path) : expanded.value.add(f.path)
  expanded.value = new Set(expanded.value)
}
function isChecked(f: RemoteFile): boolean { return checked.value.has(f.path) }

async function create(): Promise<void> {
  const paths: string[] = []
  const all = collect(props.files)
  for (const p of checked.value) {
    const f = all.find(x => x.path === p)
    if (!f) continue
    if (f.isDir) for (const x of collect(f.children ?? [])) if (!x.isDir) paths.push(x.path)
    else paths.push(f.path)
  }
  if (!paths.length) { notify('请先勾选要下载的文件', 'info'); return }
  const r = await api.taskCreate(paths)
  await Promise.all([refreshTasks(), refreshStats()])
  notify(`已创建 ${r.created} 个下载任务`, 'ok')
  emit('close')
  store.parsed = null
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="dialog">
      <div class="dialog-head">解析结果 <span style="font-size:12px;color:var(--text-3);margin-left:8px">{{ store.parsed?.message }}</span>
        <button class="icon-btn x" @click="emit('close')">✕</button>
      </div>
      <div class="dialog-body">
        <template v-for="f in props.files" :key="f.path">
          <div class="tree-file-row" @click="toggle(f)">
            <input type="checkbox" class="checkbox" :checked="isChecked(f)" @click.stop="toggle(f)" />
            <span class="ficon" :class="{ dir: f.isDir }">{{ f.isDir ? '📁' : '📄' }}</span>
            <span>{{ f.name }}</span>
            <span class="size">{{ f.isDir ? fmtSize(dirSize(f)) : fmtSize(f.size) }}</span>
            <span v-if="f.isDir" style="color:var(--text-3)" @click.stop="toggleDir(f)">{{ expanded.has(f.path) ? '收起' : '展开' }}</span>
          </div>
          <template v-if="f.isDir && expanded.has(f.path)">
            <template v-for="c in f.children" :key="c.path">
              <div class="tree-file-row" style="padding-left:28px" @click="toggle(c)">
                <input type="checkbox" class="checkbox" :checked="isChecked(c)" @click.stop="toggle(c)" />
                <span class="ficon" :class="{ dir: c.isDir }">{{ c.isDir ? '📁' : '📄' }}</span>
                <span>{{ c.name }}</span>
                <span class="size">{{ c.isDir ? fmtSize(dirSize(c)) : fmtSize(c.size) }}</span>
                <span v-if="c.isDir" style="color:var(--text-3)" @click.stop="toggleDir(c)">{{ expanded.has(c.path) ? '收起' : '展开' }}</span>
              </div>
              <template v-if="c.isDir && expanded.has(c.path)">
                <div v-for="g in c.children" :key="g.path" class="tree-file-row" style="padding-left:48px" @click="toggle(g)">
                  <input type="checkbox" class="checkbox" :checked="isChecked(g)" @click.stop="toggle(g)" />
                  <span class="ficon">📄</span>
                  <span>{{ g.name }}</span>
                  <span class="size">{{ fmtSize(g.size) }}</span>
                </div>
              </template>
            </template>
          </template>
        </template>
      </div>
      <div class="dialog-foot">
        <span style="margin-right:auto; font-size:13px; color:var(--text-2)">已选 {{ checkedFileCount }} 个文件</span>
        <button class="btn" @click="emit('close')">取消</button>
        <button class="btn primary" @click="create">创建下载任务（{{ checkedFileCount }}）</button>
      </div>
    </div>
  </div>
</template>
