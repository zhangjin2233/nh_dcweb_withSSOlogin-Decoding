let creatElement = (tag, target, attrs) => {
  let el = document.createElement(tag)
  if (attrs && typeof attrs === 'object') {
      for (let key in attrs) {
          el.setAtrribute ? el.setAtrribute(key, attrs[key]) : el[key] = attrs[key]
      }
  }
  target.append(el)
}


let setTabs = () => {
  let head = document.getElementsByTagName('head')[0]
  creatElement('title', head, { innerText: dcConfig.page.title })
  creatElement('link', head, { href: dcConfig.page.tabIcon, rel: 'shortcut icon' })
}

export default setTabs