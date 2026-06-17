(function () {
    'use strict';

    function getSiteBase() {
        if (window.SEO_SITE_BASE) return String(window.SEO_SITE_BASE).replace(/\/$/, '');
        if (window.SEO_SITE && window.SEO_SITE.url) return String(window.SEO_SITE.url).replace(/\/$/, '');
        var parts = location.pathname.split('/').filter(Boolean);
        var last = parts[parts.length - 1] || '';
        if (/\.html?$/i.test(last)) parts.pop();
        var basePath = parts.length ? '/' + parts.join('/') : '';
        return location.origin + basePath;
    }

    function absUrl(path) {
        var base = getSiteBase();
        if (!path) return base + '/';
        if (/^https?:\/\//i.test(path)) return path;
        return base + '/' + String(path).replace(/^\//, '');
    }

    function resolvePageId() {
        if (window.SEO_PAGE_ID) return window.SEO_PAGE_ID;
        var file = location.pathname.split('/').pop() || 'index.html';
        if (file === '' || file === '/') file = 'index.html';
        var map = {
            'index.html': 'home',
            'atizapan.html': 'atizapan',
            'naucalpan.html': 'naucalpan',
            'tlalnepantla.html': 'tlalnepantla',
            'nicolas-romero.html': 'nicolas-romero',
            'cuatitlan-izcalli.html': 'cuatitlan-izcalli'
        };
        return map[file] || 'home';
    }

    function upsertMeta(attr, key, content) {
        if (!content) return;
        var selector = 'meta[' + attr + '="' + key + '"]';
        var el = document.querySelector(selector);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    }

    function upsertLink(rel, href, extra) {
        var selector = 'link[rel="' + rel + '"]';
        var el = document.querySelector(selector);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
        if (extra) Object.keys(extra).forEach(function (k) { el.setAttribute(k, extra[k]); });
    }

    function injectJsonLd(data) {
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    function buildSchemas(pageId, page, site, pageUrl, imageUrl) {
        var schemas = [];

        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'NewsMediaOrganization',
            name: site.name,
            url: absUrl('index.html'),
            description: site.tagline,
            inLanguage: 'es-MX',
            areaServed: {
                '@type': 'AdministrativeArea',
                name: 'Estado de México',
                containedInPlace: { '@type': 'Country', name: 'México' }
            }
        });

        if (pageId === 'home') {
            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: site.name,
                url: absUrl('index.html'),
                description: page.description,
                inLanguage: 'es-MX',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: absUrl('search.html') + '?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                }
            });

            var municipios = ['atizapan', 'naucalpan', 'tlalnepantla', 'nicolas-romero', 'cuatitlan-izcalli'];
            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Noticias por municipio del Edomex',
                itemListElement: municipios.map(function (id, i) {
                    var m = pages[id];
                    return {
                        '@type': 'ListItem',
                        position: i + 1,
                        name: m ? m.nombreCompleto : id,
                        url: absUrl(m ? m.path : id + '.html')
                    };
                })
            });
        } else if (page.nombreCompleto) {
            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: page.title,
                url: pageUrl,
                description: page.description,
                inLanguage: 'es-MX',
                isPartOf: { '@type': 'WebSite', name: site.name, url: absUrl('index.html') },
                about: {
                    '@type': 'City',
                    name: page.nombreCompleto,
                    alternateName: page.nombreCorto,
                    address: {
                        '@type': 'PostalAddress',
                        addressLocality: page.nombreCompleto,
                        addressRegion: 'Estado de México',
                        addressCountry: 'MX'
                    }
                },
                keywords: (page.keywords || []).join(', ')
            });

            schemas.push({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Inicio', item: absUrl('index.html') },
                    { '@type': 'ListItem', position: 2, name: page.nombreCompleto, item: pageUrl }
                ]
            });
        }

        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            url: pageUrl,
            description: page.description,
            inLanguage: 'es-MX',
            isPartOf: { '@type': 'WebSite', name: site.name, url: absUrl('index.html') },
            primaryImageOfPage: imageUrl
        });

        return schemas;
    }

    function injectCityIntro(page) {
        if (!page.h1 || !page.intro) return;
        var main = document.querySelector('main');
        if (!main || document.querySelector('.city-seo-intro')) return;

        var section = document.createElement('section');
        section.className = 'city-seo-intro';
        section.setAttribute('aria-label', 'Información del municipio');
        section.innerHTML =
            '<h1 class="city-seo-title">' + page.h1 + '</h1>' +
            '<p class="city-seo-text">' + page.intro + '</p>' +
            '<p class="city-seo-keywords" aria-hidden="true">' +
            (page.keywords || []).slice(0, 8).join(' · ') +
            '</p>';

        main.insertBefore(section, main.firstChild);
    }

    function injectHomeIntro(page) {
        var hero = document.querySelector('.hero .section-head');
        if (!hero || document.querySelector('.city-seo-intro')) return;

        var wrap = document.createElement('div');
        wrap.className = 'city-seo-intro city-seo-intro--home';
        wrap.innerHTML =
            '<h1 class="city-seo-title">' + page.h1 + '</h1>' +
            '<p class="city-seo-text">' + page.intro + '</p>';

        hero.insertBefore(wrap, hero.firstChild);
    }

    function applySeo() {
        var site = window.SEO_SITE || {};
        var pages = window.SEO_PAGES || {};
        var pageId = resolvePageId();
        var page = pages[pageId] || pages.home;
        if (!page) return;

        var pageUrl = absUrl(page.path || 'index.html');
        var imageUrl = absUrl(page.image || site.defaultImage || 'img/feria.jpg');
        var keywords = (page.keywords || []).join(', ');

        document.title = page.title;

        upsertMeta('name', 'description', page.description);
        upsertMeta('name', 'keywords', keywords);
        upsertMeta('name', 'author', site.name);
        upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
        upsertMeta('name', 'googlebot', 'index, follow');
        upsertMeta('name', 'geo.region', site.region || 'MX-MEX');
        if (page.placename) upsertMeta('name', 'geo.placename', page.placename);
        if (page.geo) {
            upsertMeta('name', 'ICBM', page.geo.lat + ', ' + page.geo.lng);
            upsertMeta('name', 'geo.position', page.geo.lat + ';' + page.geo.lng);
        }

        upsertLink('canonical', pageUrl);
        upsertLink('alternate', pageUrl, { hreflang: 'es-mx' });

        upsertMeta('property', 'og:type', pageId === 'home' ? 'website' : 'article');
        upsertMeta('property', 'og:site_name', site.name);
        upsertMeta('property', 'og:title', page.title);
        upsertMeta('property', 'og:description', page.description);
        upsertMeta('property', 'og:url', pageUrl);
        upsertMeta('property', 'og:image', imageUrl);
        upsertMeta('property', 'og:locale', site.locale || 'es_MX');

        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', page.title);
        upsertMeta('name', 'twitter:description', page.description);
        upsertMeta('name', 'twitter:image', imageUrl);
        if (site.twitter) upsertMeta('name', 'twitter:site', site.twitter);

        buildSchemas(pageId, page, site, pageUrl, imageUrl).forEach(injectJsonLd);
    }

    applySeo();

    document.addEventListener('DOMContentLoaded', function () {
        var pageId = resolvePageId();
        var page = (window.SEO_PAGES || {})[pageId] || (window.SEO_PAGES || {}).home;
        if (!page) return;
        if (pageId === 'home') injectHomeIntro(page);
        else injectCityIntro(page);
    });
})();
