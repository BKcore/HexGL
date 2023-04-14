const _VERSION = "1.0.2",
    _SITE = "https://hexgl.bkcore.com",
    _DEBUG = true,
    _ASSETS_ = [
        "/geometries/bonus/base/base.js",
        "/geometries/booster/booster.js",
        "/geometries/ships/feisar/feisar.js",
        "/geometries/tracks/cityscape/track.js",
        "/geometries/tracks/cityscape/scrapers2.js",
        "/geometries/tracks/cityscape/scrapers1.js",
        "/geometries/tracks/cityscape/start.js",
        "/geometries/tracks/cityscape/startbanner.js",
        "/geometries/tracks/cityscape/bonus/speed.js",
        "/audio/bg.ogg",
        "/audio/crash.ogg",
        "/audio/destroyed.ogg",
        "/audio/boost.ogg",
        "/audio/wind.ogg",
        "/textures.full/particles/spark.png",
        "/textures.full/hud/hex.jpg",
        "/textures.full/particles/cloud.png",
        "/textures.full/ships/feisar/diffuse.jpg",
        "/textures.full/ships/feisar/specular.jpg",
        "/textures.full/ships/feisar/normal.jpg",
        "/textures.full/ships/feisar/booster/booster.png",
        "/textures.full/ships/feisar/booster/boostersprite.jpg",
        "/textures.full/tracks/cityscape/diffuse.jpg",
        "/textures.full/tracks/cityscape/specular.jpg",
        "/textures.full/tracks/cityscape/scrapers1/diffuse.jpg",
        "/textures.full/tracks/cityscape/normal.jpg",
        "/textures.full/tracks/cityscape/scrapers1/specular.jpg",
        "/textures.full/tracks/cityscape/scrapers1/normal.jpg",
        "/textures.full/tracks/cityscape/scrapers2/diffuse.jpg",
        "/textures.full/tracks/cityscape/scrapers2/specular.jpg",
        "/textures.full/tracks/cityscape/scrapers2/normal.jpg",
        "/textures.full/tracks/cityscape/start/diffuse.jpg",
        "/textures.full/tracks/cityscape/start/normal.jpg",
        "/textures.full/tracks/cityscape/start/specular.jpg",
        "/textures.full/tracks/cityscape/start/start.jpg",
        "/textures.full/bonus/base/diffuse.jpg",
        "/textures.full/bonus/base/normal.jpg",
        "/textures.full/bonus/base/specular.jpg",
        "/textures.full/skybox/dawnclouds/px.jpg",
        "/textures.full/skybox/dawnclouds/nx.jpg",
        "/textures.full/skybox/dawnclouds/py.jpg",
        "/textures.full/skybox/dawnclouds/ny.jpg",
        "/textures.full/skybox/dawnclouds/pz.jpg",
        "/textures.full/skybox/dawnclouds/nz.jpg",
        "/textures.full/tracks/cityscape/collision.png",
        "/textures.full/tracks/cityscape/height.png",
        "/textures.full/hud/hud-bg.png",
        "/textures.full/hud/hud-fg-speed.png",
        "/textures.full/hud/hud-fg-shield.png",

        "/css/multi.css",
        "/css/fonts.css",
        "/css/fonts.css",

        "/libs/leap-0.4.1.min.js",
        "/libs/Three.dev.js",
        "/libs/ShaderExtras.js",
        "/libs/postprocessing/EffectComposer.js",
        "/libs/postprocessing/RenderPass.js",
        "/libs/postprocessing/BloomPass.js",
        "/libs/postprocessing/ShaderPass.js",
        "/libs/postprocessing/MaskPass.js",
        "/libs/Detector.js",
        "/libs/Stats.js",
        "/libs/DAT.GUI.min.js",

        "/bkcore.coffee/controllers/TouchController.js",
        "/bkcore.coffee/controllers/OrientationController.js",
        "/bkcore.coffee/controllers/GamepadController.js",
        "/bkcore.coffee/Timer.js",
        "/bkcore.coffee/ImageData.js",
        "/bkcore.coffee/Utils.js",
        "/bkcore/threejs/RenderManager.js",
        "/bkcore/threejs/Shaders.js",
        "/bkcore/threejs/Particles.js",
        "/bkcore/threejs/Loader.js",
        "/bkcore/Audio.js",
        "/bkcore/hexgl/HUD.js",
        "/bkcore/hexgl/RaceData.js",
        "/bkcore/hexgl/ShipControls.js",
        "/bkcore/hexgl/ShipEffects.js",
        "/bkcore/hexgl/CameraChase.js",
        "/bkcore/hexgl/Gameplay.js",
        "/bkcore/hexgl/tracks/Cityscape.js",
        "/bkcore/hexgl/HexGL.js",
        "/launch.js",
    ],
    _RECACHELIST_ = ["/clear-cache.html"],
    _IGNORELIST_ = [],
    _STAT_CACHE_NAME = `static-cache-${_VERSION}`,
    _DYN_CACHE_NAME = `dynamic-cache-${_VERSION}`,
    EVENTS = {
        ACTIVATE: "activate",
        FETCH: "fetch",
        MESSAGE: "message",
        PUSH: "push",
    },
    METHODS = {
        GET: "GET",
        POST: "POST",
    },
    H_TRUE = "true",
    H_FALSE = "false";

const matchPath = (referencePath, testPath) => {
    testPath = testPath.split("?")[0];
    return referencePath === testPath;
};

const isIgnored = (path) => _IGNORELIST_.some((ignore) => matchPath(ignore, path)),
    isRecache = (path) => _RECACHELIST_.some((recache) => matchPath(recache, path)),
    canSetDynCache = (path, event) => !isIgnored(path) && (event.request.method !== METHODS.POST),
    canClearDynCache = (path, event) => isRecache(path) || (event.request.method === METHODS.POST);

self.addEventListener(EVENTS.ACTIVATE, (event) =>
    event.waitUntil(caches.keys().then(async (keys) =>
        await Promise.all(keys.filter((key) => key != _STAT_CACHE_NAME).map(async (key) =>
            await caches.delete(key))).then(async (_) =>
                await caches.open(_STAT_CACHE_NAME).then(async (cache) => await Promise.all(_ASSETS_.map(async (asset) => {
                    const matched = await cache.match(asset);
                    if (!(matched && matched.status === 200)) {
                        try {
                            await cache.add(asset);
                        } catch (e) { }
                    }
                }))).catch((e) => {
                    console.error(e);
                    return caches.delete(_STAT_CACHE_NAME);
                })).catch((err) => {
                    console.error(err);
                    return err;
                }))
        .catch((err) => {
            console.error(err);
            return err;
        })));
const netFetchResponseHandler = async (path, event, FetchRes) => {
    if (FetchRes.status < 300) {
        if (isRecache(path)) {
            await caches.delete(_STAT_CACHE_NAME);
            await caches.delete(_DYN_CACHE_NAME);
        }
        if (_ASSETS_.includes(path)) {
            try {
                const cache = await caches.open(_STAT_CACHE_NAME);
                cache.put(event.request.url, FetchRes.clone());
                return FetchRes;
            } catch (e) {
                console.error(e);
                return FetchRes;
            }
        } else if (canSetDynCache(path, event)) {
            try {
                const cache = await caches.open(_DYN_CACHE_NAME);
                cache.put(event.request.url, FetchRes.clone());
                return FetchRes;
            } catch (e) {
                console.error(e);
                return FetchRes;
            }
        }
    }
    throw Error(event);
};

const cacheFetchResponseHandler = async (path, event, CacheRes) => {
    if (CacheRes && CacheRes.status < 300) {
        console.log("yeas")
        if (isRecache(path)) {
            console.log("yea2s")
            await caches.delete(_STAT_CACHE_NAME);
            await caches.delete(_DYN_CACHE_NAME);
        }
        return CacheRes;
    }
    return fetch(event.request)
        .then(async (NetRes) => netFetchResponseHandler(path, event, NetRes))
        .catch(async (e) => netFetchErrorHandler(path, event, e))
};

const netFetchErrorHandler = async (path, event, error) => {
    try {
        const cachedResponse = await caches.match(event.request.url);
        if (cachedResponse) {
            return cachedResponse;
        }
    } catch (e) {
        console.log(error, e);
    }
    throw Error(event);
};

self.addEventListener(EVENTS.FETCH, async (event) => {
    const path = event.request.url.replace(_SITE, "");
    event.respondWith(
        caches.match(event.request)
            .then(async (CachedRes) => cacheFetchResponseHandler(path, event, CachedRes))
            .catch(async (e) => fetch(event.request)
                .then(async (NetRes) => netFetchResponseHandler(path, event, NetRes))
                .catch(async (e) => netFetchErrorHandler(path, event, e))
            ));
});

self.addEventListener(EVENTS.MESSAGE, async (event) => {
    if (event.data.action === "skipWaiting") {
        self.skipWaiting();
    }
    if (event.data.action == "clear-cache") {
        await caches.delete(_STAT_CACHE_NAME);
        await caches.delete(_DYN_CACHE_NAME);
    }
});