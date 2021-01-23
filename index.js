// ==UserScript==
// @name         easy seed
// @namespace    https://github.com/techmovie/easy-seed
// @version      0.1
// @description  easy seeding for different trackers
// @author       birdplane
// @match        https://passthepopcorn.me/torrents.php?id=*
// @match        https://hdbits.org/offer.php
// @match        https://hdbits.org/upload
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @note
// ==/UserScript==

(function () {
  'use strict'

  // 支持目标站点
  const DEST_SITE_MAP = {
    HDB: 'https://hdbits.org/upload'
  }
  const SITE_MAP = {
    HDB: {
      url: 'https://hdbits.org',
      host: 'hdbits.org',
      siteType: 'HDB',
      asSource: false,
      asTarget: true,
      uploadPath: '/upload.php',
      searchPath: '/browse.php',
      searchKey: 'search',
      searchParam: {
        sort: 'size',
        d: 'DESC' // orderBy
      },
      name: {
        selector: '#name'
      },
      description: {
        selector: '#descr'
      },
      imdb: {
        selector: 'input[name="imdb"]'
      },
      mediaInfo: {
        selector: 'textarea[name="techinfo"]'
      },
      category: {
        selector: '#type_category',
        map: {
          movie: '1',
          tv: '2',
          documentary: '3',
          concert: '4',
          sport: '5'
        }
      },
      codes: {
        selector: '#type_codec',
        map: {
          h264: '1',
          hevc: '5',
          x264: '1',
          x265: '5',
          mepg2: '2',
          vc1: '3',
          xvid: '4',
          bluray: '1',
          uhdbluray: '5',
          vp9: '6'
        }
      },
      videoType: {
        selector: '#type_codec',
        map: {
          bluray: '1',
          remux: '5',
          encode: '3',
          web: '6',
          hdtv: ''
        }
      }
    },
    MT: {
      url: 'https://pt.m-team.cc',
      host: 'pt.m-team.cc',
      siteType: 'NexusPHP',
      asSource: false,
      asTarget: true,
      uploadPath: '/upload.php',
      searchPath: '/browse.php',
      searchKey: 'search',
      searchParam: {
        search_area: '{key}',
        sort: '5',
        type: 'desc'
      },
      name: {
        selector: '#name'
      },
      description: {
        selector: '#descr'
      },
      imdb: {
        selector: 'input[name="url"]'
      },
      category: {
        selector: '#browsecat',
        map: {
          movie: ['401', '419', '420', '421', '439'],
          tv: ['403', '402', '435', '402', '439', '435', '438'],
          documentary: ['404'],
          concert: ['406'],
          sport: ['407']
        }
      },
      codes: {
        selector: 'select[name="codec_sel"]',
        map: {
          h264: '1',
          hevc: '16',
          x264: '1',
          x265: '16',
          mepg2: '4',
          mepg4: '15',
          vc1: '2',
          xvid: '3',
          bluray: '11',
          uhdbluray: '16'
        }
      },
      videoType: {
        map: {
          bluray: ['421', '438'],
          remux: ['439'],
          encode: ['401', '419', '403', '402'],
          web: ['401', '419', '403', '402'],
          hdtv: ['419', '402'],
          dvd: ['420', '435'],
          dvdrip: ['401', '403'],
          other: ''
        }
      },
      resolution: {
        selector: 'select[name="standard_sel"]',
        map: {
          '2160p': '6',
          '1080p': '1',
          '1080i': '2',
          '720p': '3',
          '576p': '5',
          '480p': '5'
        }
      },
      area: {
        selector: 'select[name="processing_sel"]',
        map: {
          CN: '1',
          US: '2',
          EU: '2',
          HK: '3',
          TW: '3',
          JP: '4',
          KR: '5',
          OT: '6'
        }
      }
    },
    TTG: {
      url: 'https://totheglory.im',
      host: 'totheglory.im',
      siteType: 'TTG',
      asSource: false,
      asTarget: true,
      uploadPath: '/upload.php',
      searchPath: '/browse.php',
      searchKey: 'search_field',
      searchParam: {
        sort: '5',
        type: 'desc'
      },
      name: {
        selector: 'input[name="name"]'
      },
      description: {
        selector: 'textarea[name="descr"]'
      },
      imdb: {
        selector: 'input[name="imdb_c"]'
      },
      category: {
        selector: 'select[name="type"]',
        map: {
          movie: ['51', '52', '53', '54', '108', '109'],
          moviePack: [],
          tv: ['69', '70', '73', '74', '75', '76', '87', '88', '99', '90'],
          tvPack: [],
          documentary: ['62', '63', '67'],
          concert: ['59'],
          sport: ['57'],
          cartoon: ['58'],
          variety: ['103', '60', '101']
        }
      },
      videoType: {
        map: {
          bluray: ['54', '109', '67'],
          remux: '',
          encode: '',
          web: '',
          hdtv: '',
          dvd: ['51'],
          dvdrip: ['51'],
          other: ''
        }
      },
      resolution: {
        map: {
          '2160p': ['108', '109', '67'],
          '1080p': ['53', '63', '70', '75'],
          '1080i': ['53', '63', '70', '75'],
          '720p': ['52', '62', '69', '76'],
          '576p': '',
          '480p': ''
        }
      },
      area: {
        map: {
          CN: ['76', '75', '90'],
          US: ['69', '70', '87'],
          EU: ['69', '70', '87'],
          HK: ['76', '75', '90'],
          TW: ['76', '75', '90'],
          JP: ['73', '88', '101'],
          KR: ['74', '99', '103'],
          OT: ''
        }
      }
    },
    PTP: {
      url: 'https://passthepopcorn.me',
      host: 'passthepopcorn.me',
      siteType: 'HDB',
      uploadPath: '/upload.php',
      searchPath: '/torrents.php',
      searchKey: 'search',
      searchParam: {
        action: 'advanced'
      }
    }
  }
  // 快速检索
  const SEARCH_SITE_MAP = {
    HDB: 'https://hdbits.org/browse.php?search={imdbid}&sort=size&h=8&d=DESC',
    PTP: 'https://passthepopcorn.me/torrents.php?action=advanced&searchstr={imdbid}',
    MTeam: 'https://pt.m-team.cc/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area={searchArea}&search_mode=0',
    TTG: 'https://totheglory.im/browse.php?search_field={imdbid}&c=M&sort=5&type=desc',
    CHD: 'https://chdbits.co/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0',
    BHD: 'https://beyond-hd.me/torrents/all?doSearch=Search&imdb={imdbid}&sorting=size&direction=desc',
    BLU: 'https://blutopia.xyz/torrents?imdb={imdbid}',
    AHD: 'https://awesome-hd.me/torrents.php?searchstr={imdbid}'
  }

  const TORRENT_INFO = {
    title: '', // 标题
    subtitle: '', // 副标题
    description: '', // 描述
    year: '',
    type: '', // 电影、电视、音乐等
    videoType: '', // bluray remux encodes web-dl
    source: '', // 视频来源
    codes: '', // 视频编码
    audioCodes: '',
    resolution: '', // 分辨率
    area: '', // 地区
    doubanUrl: '', // 豆瓣地址
    imdbUrl: '', // imdb地址
    tags: '',
    mediaInfo: '',
    bdinfo: '',
    screenshots: [],
    logs: '',
    movieAkaName: '',
    movieName: ''
  }
  const getSiteName = (host) => {
    let siteName = ''
    try {
      Object.keys(SITE_MAP).forEach(key => {
        const hostName = SITE_MAP[key].host
        if (hostName && host === hostName) {
          siteName = key
        }
      })
      return siteName
    } catch (error) {
      if (error.message !== 'end loop') {
        console.log(error)
      }
    }
  }
  const currentSiteName = getSiteName(location.host)
  console.log(currentSiteName)

  // =============目标站点方法============

  const getDescription = (info) => {
    const logs = info.logs ? `eac3to logs:\n[hide]${info.logs}[/hide]\n\n` : ''
    const bdinfo = info.bdinfo ? `BDInfo:\n${info.bdinfo}\n\n` : ''
    return `${info.description}\n\n${logs}${bdinfo}\n\nScreens:\n${info.screenshots.join('')}`
  }
  const fillTargetForm = (info) => {
    console.log(info)
    const siteInfo = SITE_MAP[currentSiteName]
    if (currentSiteName === 'HDB') {
      let mediaTitle = info.title.replace(/([^\d]+)\s+(\d+)/, (match, p1, p2) => {
        return `${info.movieName || info.movieAkaName} ${p2}`
      })
      if (info.videoType === 'remux') {
        mediaTitle = mediaTitle.replace(/ (bluray|blu-ray)/ig, '')
      }
      info.title = mediaTitle
    }
    $j(siteInfo.name.selector).val(info.title)
    const mediaInfo = info.videoType === 'bluray' ? '' : info.mediaInfo
    let description = getDescription(info)
    if (siteInfo.mediaInfo) {
      $j(siteInfo.mediaInfo.selector).val(mediaInfo)
    } else {
      description += `\n\n'[quote]${mediaInfo}[/quote]`
    }
    $j(siteInfo.description.selector).val(description)
    $j(siteInfo.category.selector).val(siteInfo.category.map[info.type])
    $j(siteInfo.codes.selector).val(siteInfo.codes.map[info.codes])
    $j(siteInfo.videoType.selector).val(siteInfo.videoType.map[info.videoType])
    $j(siteInfo.imdb.selector).val(info.imdbUrl)
  }
  // =============源站点方法==============

  // =======PTP站点方法=======
  const getPTPInfo = () => {
    const torrentId = getUrlParam('torrentid')
    if (!torrentId) {
      return false
    }
    const torrentDom = $(`#torrent_${torrentId}`)
    const ptpMovieTitle = $('.page__title').text().match(/(^|])([^\d[]+)/)[2].trim()
    const [movieName, movieAkaName = ''] = ptpMovieTitle.split(' AKA ')
    TORRENT_INFO.movieName = movieName
    TORRENT_INFO.movieAkaName = movieAkaName
    TORRENT_INFO.year = $('.page__title').text().match(/\[(\d+)\]/)[2]
    const torrentHeaderDom = $(`#group_torrent_header_${torrentId}`)
    let torrentName = torrentHeaderDom.data('releasename')
    torrentName = torrentName.replaceAll('.', ' ').replace(/ (\d{1}) (\d{1})/, ' $1.$2').trim()
    TORRENT_INFO.title = torrentName
    TORRENT_INFO.type = getPTPType()
    if (TORRENT_INFO.type === 'music') {
      TORRENT_INFO.description = $('#synopsis').text()
    }
    const infoArray = torrentHeaderDom.find('#PermaLinkedTorrentToggler').text().replace(/ /g, '').split('/')
    const [codes, container, source, resolution, ...otherInfo] = infoArray
    const isRemux = otherInfo.includes('Remux')
    TORRENT_INFO.videoType = source === 'WEB' ? 'web' : getVideoType(container, isRemux)
    TORRENT_INFO.codes = getPtpCodes(codes)
    TORRENT_INFO.source = source
    TORRENT_INFO.resolution = resolution
    const { logs, bdinfo } = getPTPLogsOrBDInfo(torrentDom)
    TORRENT_INFO.logs = logs
    TORRENT_INFO.bdinfo = bdinfo
    TORRENT_INFO.mediaInfo = `${torrentDom.find('.mediainfo.mediainfo--in-release-description').next('blockquote').text()}`
    TORRENT_INFO.screenshots = getPTPImage(torrentDom)
    TORRENT_INFO.imdbUrl = $('#imdb-title-link').attr('href') || ''
    createSeedDom(torrentDom.find('>td'), TORRENT_INFO)
  }

  const getPTPType = () => {
    const typeMap = {
      'Feature Film': 'movie',
      'Short Film': 'movie',
      'Stand-up Comedy': 'other',
      Miniseries: 'tv',
      'Live Performance': 'music',
      'Movie Collection': 'movie'
    }
    const ptpType = $('#torrent-table .basic-movie-list__torrent-edition__main').eq(0).text()
    return typeMap[ptpType]
  }
  // 获取eac3to日志
  const getPTPLogsOrBDInfo = (torrentDom) => {
    const quoteList = torrentDom.find('.movie-page__torrent__panel blockquote')
    let logs = ''; let bdinfo = ''
    for (let i = 0; i < quoteList.length; i++) {
      const quoteContent = quoteList[i].textContent
      if (quoteContent.includes('eac3to')) {
        logs += `[quote]${quoteContent}[/quote]`
      }
      if (quoteContent.includes('DISC INFO:')) {
        bdinfo += `[quote]${quoteContent}[/quote]`
      }
    }
    return {
      logs,
      bdinfo
    }
  }
  // 获取截图
  const getPTPImage = (torrentDom) => {
    let isComparison = false
    let imgList = []
    const torrentInfoPanel = torrentDom.find('.movie-page__torrent__panel')
    const links = torrentInfoPanel.find('a')
    for (let i = 0; i < links.length; i++) {
      const clickFunc = links[i].getAttribute('onclick')
      if (clickFunc && clickFunc.includes('BBCode.ScreenshotComparisonToggleShow')) {
        isComparison = true
        imgList = JSON.parse(clickFunc.match(/\["http([^\]]*)\]/)[0])
        break
      }
    }
    if (!isComparison) {
      const imageDom = torrentDom.find('.bbcode__image')
      for (let i = 0; i < imageDom.length; i++) {
        imgList.push(imageDom[i].getAttribute('src'))
      }
    }
    return imgList
  }
  const getPtpCodes = (codes) => {
    if (codes === 'BD66' || codes === 'BD100') {
      return 'uhdbluray'
    }
    if (codes.startsWith('BD')) {
      return 'bluray'
    }
    if (codes.startsWith('DVD')) {
      return 'dvd'
    }
    return codes.replace(/[.-]/g, '').toLowerCase()
  }
  const getVideoType = (container, isRemux) => {
    const isBluray = container === 'm2ts' || container === 'ISO'
    const isDVD = container === 'DVD9' || container === 'DVD5'
    let type = ''
    if (isRemux) {
      type = 'remux'
    } else if (isBluray) {
      type = 'bluray'
    } else if (isDVD) {
      type = 'dvd'
    } else if (container.match(/MKV|AVI|MP4/i)) {
      type = 'encode'
    }
    return type
  }
  // =======PTP站点方法结束=======
  // =============公共方法=================

  const getTorrentInfo = () => {
    if (currentSiteName === 'PTP') {
      getPTPInfo()
    }
  }
  const getUrlParam = (key) => {
    const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)')
    const regArray = location.search.substr(1).match(reg)
    if (regArray) {
      return unescape(regArray[2])
    }
    return ''
  }
  const createSeedDom = (torrentDom, torrentInfo) => {
    const siteList = Object.keys(DEST_SITE_MAP).map(siteName => {
      return `<li><a href="${DEST_SITE_MAP[siteName]}#torrentInfo=${encodeURIComponent(JSON.stringify(torrentInfo))}" target="_blank">${siteName}</a></li>`
    })
    const searchList = Object.keys(SEARCH_SITE_MAP).map(siteName => {
      const imdbId = torrentInfo.imdbUrl ? /tt\d+/.exec(torrentInfo.imdbUrl)[0] : ''
      let url = ''
      let searchKeyWord = imdbId || torrentInfo.movieAkaName || torrentInfo.movieName
      if (siteName === 'TTG' && imdbId) {
        searchKeyWord = searchKeyWord.replace('tt', 'imdb')
      }
      url = SEARCH_SITE_MAP[siteName].replace('{imdbid}', searchKeyWord)
      url = url.replace('{searchArea}', imdbId ? '4' : '0')
      return `<li><a href="${url}" target="_blank">${siteName}</a></li>`
    })
    const seedDom = `
    <div class="seed-dom movie-page__torrent__panel">
      <h4>一键转种 🎬</h4>
      <ul class="site-list">
        ${siteList.join('')}
      </ul>
      <h4>转缩略图 ⏫</h4>
      <div class="upload-section">
        <button id="img-transfer">开始转换</button>
        <div class="checkbox">
          <input type="checkbox" id="nsfw">
          <label for="nsfw">是否为NSFW</label>
        </div>
        <div class="upload-status"></div>
      </div>
      <h4>快速检索 🔍</h4>
      <ul class="search-list">
        ${searchList.join('')}
      </ul>
    </div>
    `
    torrentDom.prepend(seedDom)
  }
  const transferImgs = () => {
    const statusDom = $('.upload-section .upload-status')
    try {
      if (TORRENT_INFO.screenshots.length < 1) {
        throw new Error('获取图片列表失败')
      }
      const imgList = TORRENT_INFO.screenshots.join('\n')
      const isNSFW = $('#nsfw').is(':checked')
      const params = encodeURI(`imgs=${imgList}&content_type=${isNSFW ? 1 : 0}&max_th_size=300`)
      statusDom.text('转换中...')
      $('#img-transfer').attr('disabled', true).addClass('is-disabled')
      GM_xmlhttpRequest({
        url: 'https://pixhost.to/remote/',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: params,
        onload (res) {
          $('#img-transfer').removeAttr('disabled').removeClass('is-disabled')
          const data = res.responseText.match(/(upload_results = )({.*})(;)/)
          if (!data) {
            throw new Error('上传失败，请重试')
          }
          let imgResultList = []
          if (data && data.length) {
            imgResultList = JSON.parse(data[2]).images
            if (imgResultList.length) {
              TORRENT_INFO.screenshots = imgResultList.map(imgData => {
                return `[url=${imgData.show_url}][img]${imgData.th_url}[/img][/url]`
              })
              replaceTorrentInfo()
              statusDom.text('转换成功！')
            }
          } else {
            throw new Error('上传失败，请重试')
          }
        }
      })
    } catch (error) {
      $('#img-transfer').removeAttr('disabled').removeClass('is-disabled')
      statusDom.text(error.message)
    }
  }

  const replaceTorrentInfo = () => {
    $('.site-list a').each((index, link) => {
      const torrentInfo = encodeURIComponent(JSON.stringify(TORRENT_INFO))
      const newHref = $(link).attr('href').replace(/(#torrentInfo=)(.+)/, `$1${torrentInfo}`)
      $(link).attr('href', newHref)
    })
  }
  // =============页面注入开始==============
  let torrentParams = location.hash ? location.hash.match(/(^|#)torrentInfo=([^#]*)(#|$)/)[2] : null
  if (currentSiteName) {
    if (torrentParams) {
      torrentParams = JSON.parse(decodeURIComponent(torrentParams))
      fillTargetForm(torrentParams)
    }
    // 向当前所在站点添加按钮等内容
    getTorrentInfo()
    // 原图转缩略图
    if ($('#img-transfer')) {
      $('#img-transfer').click(() => {
        transferImgs()
      })
    }
  }
  GM_addStyle(`
    .seed-dom h4{
      text-align: center;
      margin: 0;
      margin-bottom: 15px;
    }
    .site-list,.search-list{
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }
    .seed-dom li {
      margin-right: 5px;
      padding-right: 5px;
      border-right: 1px solid #fff;
    }
    .seed-dom li:last-child{
      border: none;
    }
    .seed-dom li a{
      font-weight: 600;
    }
    .upload-section{
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
      align-items: center;
    }
    .upload-section .upload-status{
      margin-left: 5px;
      font-size: 14px;
    }
    #img-transfer{
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      background: #fff;
      border: 1px solid #dcdfe6;
      color: #606266;
      -webkit-appearance: none;
      text-align: center;
      box-sizing: border-box;
      outline: none;
      transition: .1s;
      font-weight: 500;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      padding: 8px 20px;
      font-size: 14px;
      border-radius: 4px;
      margin:0;
      margin-right: 5px;
    }
    #img-transfer:hover {
      background: #fff;
      border-color: #409eff;
      color: #409eff
    }
    #img-transfer.is-disabled, #img-transfer.is-disabled:hover {
      color: #c0c4cc;
      cursor: not-allowed;
      background-image: none;
      background-color: #fff;
      border-color: #ebeef5;
    }
  `)
})()
