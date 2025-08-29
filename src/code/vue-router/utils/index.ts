interface LocationNormalized {
  path: string
  fullPath: string
  hash: string
  query: Record<string, string>
}

/**
 * 使用 new URL 解析 location，得到标准化的 path、query、hash
 * @param location 原始路由字符串，可能为绝对路径或相对路径
 * @param current 当前路径，用于与相对路径拼接绝对路径
 */
export function parseURL(location: string, current: string = ''): LocationNormalized {
  // 使用 new URL 自动解析 path、query、hash

  // 相对路径
  if (!location.startsWith('/')) {
    if (current && !current.endsWith('/')) current += '/'
    location = current + location
  }
  const url = new URL(location, window.location.origin)

  // 解析 query 参数为对象
  const query = Object.fromEntries(url.searchParams.entries())

  const { pathname, search, hash } = url

  return {
    path: pathname, // 纯路径，例如 "/home"
    fullPath: pathname + search + hash, // 完整路径
    query, // 查询参数对象，例如 { page: "1" }
    hash, // 哈希，例如 "#top"
  }
}

interface LocationPartial {
  path: string
  query?: Record<string, string>
  hash?: string
}

/**
 * 将路由的部分信息序列化为完整的 URL 字符串
 * @param location 部分路由信息对象，包含 path、query、hash
 * @returns 拼接后的完整路径字符串，例如 "/home?page=1#top"
 */
export function stringifyURL(location: LocationPartial) {
  const { path, query, hash } = location
  // 将 query 对象转成 ?a=1&b=2 形式
  const search = query && Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''
  return path + search + (hash || '')
}
