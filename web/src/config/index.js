let creatElement = (tag, target, attrs) => {
  let el = document.createElement(tag)
  if (attrs && typeof attrs === 'object') {
      for (let key in attrs) {
          el.setAtrribute ? el.setAtrribute(key, attrs[key]) : el[key] = attrs[key]
      }
  }
  target.append(el)
}


let runConfig = () => {
  let head = document.getElementsByTagName('head')[0]
  creatElement('title', head, { innerText: Config.title })
  creatElement('link', head, { href: Config.icon, rel: 'shortcut icon' })
}

export default runConfig