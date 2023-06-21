export const data = "# 26. WebMvc：DispatcherServlet的工作原理\n" +
"\n" +
"这一篇的内容算是面试中可能比较经常问的基础吧，`DispatcherServlet` 的工作流程步骤简直跟背圣经一样，背的熟不如来源码底层一探究竟。\n" +
"\n" +
"## 0. DispatcherServlet工作流程步骤\n" +
"\n" +
"1. 浏览器向服务器发起请求，由 `DispatcherServlet` 接收请求；\n" +
"2. `DispatcherServlet` 委托 `HandlerMapping`，根据 url 来选择一个合适的 Controller 中的方法；\n" +
"3. `HandlerMapping` 找到合适的 Controller 后，并根据已配置的拦截器，整理出一个 Handler，返回给 `DispatcherServlet`；\n" +
"4. `DispatcherServlet` 收到 Handler 后委托 `HandlerAdapter`，将该请求代理给 `HandlerMapping` 选定的 Controller 中的 Handler；\n" +
"5. Handler 收到请求后，实际执行 Controller 中的方法，执行完毕后会返回 ModelAndView；\n" +
"6. Controller 方法执行完毕后会返回 `ModelAndView`；\n" +
"7. `HandlerAdapter` 收到 Handler 返回的 `ModelAndView` 后返回给 `DispatcherServlet`；\n" +
"8. `DispatcherServlet` 拿到 `ModelAndView` 后委托 `ViewResolver`，由 `ViewResolver` 负责渲染视图；\n" +
"9. `ViewResolver` 渲染视图完成后，返回给 `DispatcherServlet`，由 `DispatcherServlet` 负责响应视图。\n" +
"\n" +
"下面来根据一个测试Demo来实际Debug演示 `DispatcherServlet` 的工作流程机制（为保证视图能正常渲染，demo中附加导入了 **thymeleaf** 的依赖）。\n" +
"\n" +
"```java\n" +
"@Controller\n" +
"public class DemoController {  \n" +
"    @GetMapping(\"/test\")\n" +
"    public String test() {\n" +
"        return \"test\";\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"这是一个再简单不过的 Controller 类了。Debug启动 SpringBoot 应用，浏览器发送 `/test` 请求，并在 `DispatcherServlet` 的 `service` 方法（实际上是 **`HttpServlet`**）打断点开始Debug。\n" +
"\n" +
"## 1. HttpServlet#service\n" +
"\n" +
"```java\n" +
"public void service(ServletRequest req, ServletResponse res)\n" +
"    throws ServletException, IOException {\n" +
"\n" +
"    HttpServletRequest  request;\n" +
"    HttpServletResponse response;\n" +
"\n" +
"    try {\n" +
"        request = (HttpServletRequest) req;\n" +
"        response = (HttpServletResponse) res;\n" +
"    } catch (ClassCastException e) {\n" +
"        throw new ServletException(lStrings.getString(\"http.non_http\"));\n" +
"    }\n" +
"    service(request, response);\n" +
"}\n" +
"```\n" +
"\n" +
"这部分很简单，相当于把请求类型转为http，后调用重载的方法。\n" +
"\n" +
"```java\n" +
"protected void service(HttpServletRequest req, HttpServletResponse resp)\n" +
"    throws ServletException, IOException {\n" +
"\n" +
"    String method = req.getMethod();\n" +
"\n" +
"    if (method.equals(METHOD_GET)) {\n" +
"        long lastModified = getLastModified(req);\n" +
"        if (lastModified == -1) {\n" +
"            // servlet doesn't support if-modified-since, no reason\n" +
"            // to go through further expensive logic\n" +
"            doGet(req, resp);\n" +
"        } else {\n" +
"            long ifModifiedSince;\n" +
"            try {\n" +
"                ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);\n" +
"            } catch (IllegalArgumentException iae) {\n" +
"                // Invalid date header - proceed as if none was set\n" +
"                ifModifiedSince = -1;\n" +
"            }\n" +
"            if (ifModifiedSince < (lastModified / 1000 * 1000)) {\n" +
"                // If the servlet mod time is later, call doGet()\n" +
"                // Round down to the nearest second for a proper compare\n" +
"                // A ifModifiedSince of -1 will always be less\n" +
"                maybeSetLastModified(resp, lastModified);\n" +
"                doGet(req, resp);\n" +
"            } else {\n" +
"                resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);\n" +
"            }\n" +
"        }\n" +
"\n" +
"    } else if (method.equals(METHOD_HEAD)) {\n" +
"        long lastModified = getLastModified(req);\n" +
"        maybeSetLastModified(resp, lastModified);\n" +
"        doHead(req, resp);\n" +
"\n" +
"    } else if (method.equals(METHOD_POST)) {\n" +
"        doPost(req, resp);\n" +
"\n" +
"    } else if (method.equals(METHOD_PUT)) {\n" +
"        doPut(req, resp);\n" +
"\n" +
"    } else if (method.equals(METHOD_DELETE)) {\n" +
"        doDelete(req, resp);\n" +
"\n" +
"    } // ......\n" +
"}\n" +
"```\n" +
"\n" +
"这还是属于 `HttpServlet` 的源码，它会根据请求类型来转发请求，由于 `HttpServlet` 采用模板方法模式，而模板方法是在 `DispatcherServlet` 中实现，上面的测试Demo选用GET方式，最终来到 `doGet` 方法。\n" +
"\n" +
"## 2. doGet\n" +
"\n" +
"来到 `DispatcherServlet` 的父类 `FrameworkServlet` ，发现 `doGet` 、`doPost` 等方法的方法体都只有一句话：\n" +
"\n" +
"```java\n" +
"protected final void doGet(HttpServletRequest request, HttpServletResponse response)\n" +
"        throws ServletException, IOException {\n" +
"    processRequest(request, response);\n" +
"}\n" +
"\n" +
"protected final void doPost(HttpServletRequest request, HttpServletResponse response)\n" +
"        throws ServletException, IOException {\n" +
"    processRequest(request, response);\n" +
"}\n" +
"```\n" +
"\n" +
"发现核心方法都是 `processRequest` ，那就去这个方法：\n" +
"\n" +
"## 3. processRequest\n" +
"\n" +
"（关键步骤的注释已标注在源码中）\n" +
"\n" +
"```java\n" +
"protected final void processRequest(HttpServletRequest request, HttpServletResponse response)\n" +
"        throws ServletException, IOException {\n" +
"\n" +
"    // 记录请求接收时间\n" +
"    long startTime = System.currentTimeMillis();\n" +
"    Throwable failureCause = null;\n" +
"\n" +
"    // 3.1 得到当前线程的LocaleContext\n" +
"    LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();\n" +
"    LocaleContext localeContext = buildLocaleContext(request);\n" +
"\n" +
"    // 3.2 得到当前线程的RequestAttributes\n" +
"    RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();\n" +
"    ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);\n" +
"\n" +
"    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);\n" +
"    asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());\n" +
"\n" +
"    // 3.3 初始化ContextHolder，传入新封装好的请求参数和上下文，目的是线程隔离\n" +
"    initContextHolders(request, localeContext, requestAttributes);\n" +
"\n" +
"    try {\n" +
"        // 4. 进入DispatcherServlet\n" +
"        doService(request, response);\n" +
"    }\n" +
"    catch (ServletException | IOException ex) {\n" +
"        failureCause = ex;\n" +
"        throw ex;\n" +
"    }\n" +
"    catch (Throwable ex) {\n" +
"        failureCause = ex;\n" +
"        throw new NestedServletException(\"Request processing failed\", ex);\n" +
"    }\n" +
"\n" +
"    finally {\n" +
"        // 重新获得当前线程的LocaleContext和RequestAttributes\n" +
"        resetContextHolders(request, previousLocaleContext, previousAttributes);\n" +
"        if (requestAttributes != null) {\n" +
"            requestAttributes.requestCompleted();\n" +
"        }\n" +
"        logResult(request, response, failureCause, asyncManager);\n" +
"        // 发布ServletRequestHandledEvent事件\n" +
"        publishRequestHandledEvent(request, response, startTime, failureCause);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"咱以try-catch块为分界，前面的部分是隔离当前线程，最后的finally块又是恢复当前线程，由此可以发现 SpringWebMvc 在处理之前已经做好了**线程隔离**。\n" +
"\n" +
"中间的 `doService` 方法，就是真正处理请求的部分。\n" +
"\n" +
"【由此可以发现一个 SpringWebMvc 的设计思想：**父类把处理流程抽象化，子类负责每个流程的具体实现**】\n" +
"\n" +
"上面源码中有几个标注的部分，简单看一眼都是怎么隔离线程的：\n" +
"\n" +
"### 3.1 LocaleContextHolder.getLocaleContext\n" +
"\n" +
"```java\n" +
"private static final ThreadLocal<LocaleContext> localeContextHolder = new NamedThreadLocal<>(\"LocaleContext\");\n" +
"\n" +
"public static LocaleContext getLocaleContext() {\n" +
"    LocaleContext localeContext = localeContextHolder.get();\n" +
"    if (localeContext == null) {\n" +
"        localeContext = inheritableLocaleContextHolder.get();\n" +
"    }\n" +
"    return localeContext;\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现 `localeContextHolder` 是 `ThreadLocal` 类型，是取的当前线程。\n" +
"\n" +
"### 3.2 RequestContextHolder.getRequestAttributes\n" +
"\n" +
"```java\n" +
"private static final ThreadLocal<RequestAttributes> requestAttributesHolder = new NamedThreadLocal<>(\"Request attributes\");\n" +
"\n" +
"public static RequestAttributes getRequestAttributes() {\n" +
"    RequestAttributes attributes = requestAttributesHolder.get();\n" +
"    if (attributes == null) {\n" +
"        attributes = inheritableRequestAttributesHolder.get();\n" +
"    }\n" +
"    return attributes;\n" +
"}\n" +
"```\n" +
"\n" +
"`requestAttributesHolder` 也是 `ThreadLocal` 类型，它也是取的当前线程。\n" +
"\n" +
"### 3.3 initContextHolders\n" +
"\n" +
"```java\n" +
"private void initContextHolders(HttpServletRequest request,\n" +
"        @Nullable LocaleContext localeContext, @Nullable RequestAttributes requestAttributes) {\n" +
"\n" +
"    if (localeContext != null) {\n" +
"        LocaleContextHolder.setLocaleContext(localeContext, this.threadContextInheritable);\n" +
"    }\n" +
"    if (requestAttributes != null) {\n" +
"        RequestContextHolder.setRequestAttributes(requestAttributes, this.threadContextInheritable);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现这里面是将新的 `localeContext` 、`requestAttributes` 设置到当前线程，原有线程中的对象被暂时缓存在 `processRequest` 方法中。\n" +
"\n" +
"------\n" +
"\n" +
"下面进入 `DispatcherServlet` 的核心：**`doService`** 方法。\n" +
"\n" +
"## 4. doService\n" +
"\n" +
"```java\n" +
"protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {\n" +
"    logRequest(request);\n" +
"\n" +
"    // Keep a snapshot of the request attributes in case of an include,\n" +
"    // to be able to restore the original attributes after the include.\n" +
"    Map<String, Object> attributesSnapshot = null;\n" +
"    // 4.1 判断请求参数中是否存在javax.servlet.include.request_uri\n" +
"    if (WebUtils.isIncludeRequest(request)) {\n" +
"        attributesSnapshot = new HashMap<>();\n" +
"        Enumeration<?> attrNames = request.getAttributeNames();\n" +
"        while (attrNames.hasMoreElements()) {\n" +
"            String attrName = (String) attrNames.nextElement();\n" +
"            if (this.cleanupAfterInclude || attrName.startsWith(DEFAULT_STRATEGIES_PREFIX)) {\n" +
"                attributesSnapshot.put(attrName, request.getAttribute(attrName));\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"\n" +
"    // Make framework objects available to handlers and view objects.\n" +
"    // 将IOC容器及特定组件放入request供开发使用\n" +
"    request.setAttribute(WEB_APPLICATION_CONTEXT_ATTRIBUTE, getWebApplicationContext());\n" +
"    request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);\n" +
"    request.setAttribute(THEME_RESOLVER_ATTRIBUTE, this.themeResolver);\n" +
"    request.setAttribute(THEME_SOURCE_ATTRIBUTE, getThemeSource());\n" +
"\n" +
"    // 4.2 flashMapManager\n" +
"    if (this.flashMapManager != null) {\n" +
"        FlashMap inputFlashMap = this.flashMapManager.retrieveAndUpdate(request, response);\n" +
"        if (inputFlashMap != null) {\n" +
"            request.setAttribute(INPUT_FLASH_MAP_ATTRIBUTE, Collections.unmodifiableMap(inputFlashMap));\n" +
"        }\n" +
"        request.setAttribute(OUTPUT_FLASH_MAP_ATTRIBUTE, new FlashMap());\n" +
"        request.setAttribute(FLASH_MAP_MANAGER_ATTRIBUTE, this.flashMapManager);\n" +
"    }\n" +
"\n" +
"    try {\n" +
"        // 5. doDispatch\n" +
"        doDispatch(request, response);\n" +
"    }\n" +
"    finally {\n" +
"        if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {\n" +
"            // Restore the original attribute snapshot, in case of an include.\n" +
"            if (attributesSnapshot != null) {\n" +
"                restoreAttributesAfterInclude(request, attributesSnapshot);\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"`doService` 方法中的核心是try-catch中继续往 DispatcherServlet 最核心的方法中调用，但调用之前它又额外干了几件事，咱一一来看。\n" +
"\n" +
"### 4.1 WebUtils.isIncludeRequest\n" +
"\n" +
"这个方法的内容我们比较陌生：\n" +
"\n" +
"```java\n" +
"public static final String INCLUDE_REQUEST_URI_ATTRIBUTE = \"javax.servlet.include.request_uri\";\n" +
"\n" +
"public static boolean isIncludeRequest(ServletRequest request) {\n" +
"    return (request.getAttribute(INCLUDE_REQUEST_URI_ATTRIBUTE) != null);\n" +
"}\n" +
"```\n" +
"\n" +
"它会从 request 中查看是否有 `\"javax.servlet.include.request_uri\"` 这个属性，那它又是什么呢？\n" +
"\n" +
"这又要回到 Servlet 规范中来解释了。\n" +
"\n" +
"翻看 Servlet3.0 的规范文档，在9.3.1章节中有这样一段描述：\n" +
"\n" +
"> Except for servlets obtained by using the getNamedDispatcher method, a servlet that has been invoked by another servlet using the include method of RequestDispatcher has access to the path by which it was invoked.\n" +
">\n" +
"> - javax.servlet.include.request_uri\n" +
"> - javax.servlet.include.context_path\n" +
"> - javax.servlet.include.servlet_path\n" +
"> - javax.servlet.include.path_info\n" +
"> - javax.servlet.include.query_string\n" +
">\n" +
"> These attributes are accessible from the included servlet via the getAttribute method on the request object and their values must be equal to the request URI, context path, servlet path, path info, and query string of the included servlet, respectively. If the request is subsequently included, these attributes are replaced for that include.\n" +
"\n" +
"这里面刚好提到了 `javax.servlet.include.request_uri` 。\n" +
"\n" +
"这段规范中的描述大概可以这么理解：已经被另一个 `Servlet` 使用 `RequestDispatcher` 的 `include` 方法调用过的 `Servlet`，有权访问被调用过的 `Servlet`的路径。\n" +
"\n" +
"等会。。。include。。咱在之前学习jsp的时候有过这样一个标签：`<jsp:incluede page=\"xxx.jsp\"/>` ，用它可以组合其它页面。\n" +
"\n" +
"那到这里就大概可以猜测出，判断是否有这个属性，是**为了区别页面的加载是否由include标签而来**。\n" +
"\n" +
"### 4.2 flashMapManager\n" +
"\n" +
"这个 `flashMapManager` 我们也很陌生，而且通过Debug发现它不为null：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b67d0e2321a~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"对此我们就要产生疑惑了，它又是什么？\n" +
"\n" +
"#### 4.2.1 FlashMapManager的产生背景\n" +
"\n" +
"做过开发的小伙伴都知道登录操作吧，咱都知道登录是**POST**请求，最终跳转到主页必须是一个redirect的**GET**请求，以防止表单重复提交。但是这样还是会存在一个问题，如果提交表单时传入的一些数据，在重定向的GET请求还要拿到来渲染到页面上，这个问题就不好解决了。传统的解决方案是把要渲染的数据作为url中的参数一起组合进请求路径，但这样做url太长，而且内容长度也有限。\n" +
"\n" +
"`SpringWebMvc3.1` 版本以后引入了 `FlashMapManager` 来解决这个问题。它引入了一个 `Flash Attribute` 的机制，可以在重定向跳转时将需要渲染的数据暂时放入 session 中，这样浏览器即便刷新也不会影响数据渲染。\n" +
"\n" +
"#### 4.2.2 SessionFlashMapManager\n" +
"\n" +
"上面的背景中也描述了，默认暂时会放入 session 域来保证数据渲染，`SpringWebMvc` 提供的默认实现也就是基于 session 的 `FlashMapManager` 。\n" +
"\n" +
"从类继承结构来看，它又是体现了WebMvc的类设计思想：**父类抽象化流程，子类实现**。\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b69d3eb133c~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"更细致的使用，小伙伴们可以自行搜索相关资料，小册这里只起引入作用。\n" +
"\n" +
"------\n" +
"\n" +
"`doService` 方法中上面的准备工作都完成后，下面进入 `doDispatch` 方法：\n" +
"\n" +
"## 5. doDispatch\n" +
"\n" +
"暂且不看源码实现，先看一眼文档注释原文翻译：\n" +
"\n" +
"> Process the actual dispatching to the handler. The handler will be obtained by applying the servlet's HandlerMappings in order. The HandlerAdapter will be obtained by querying the servlet's installed HandlerAdapters to find the first that supports the handler class. All HTTP methods are handled by this method. It's up to HandlerAdapters or handlers themselves to decide which methods are acceptable.\n" +
">\n" +
"> 真正地调度处理器。\n" +
">\n" +
"> 通过按顺序应用 Servlet 的 `HandlerMappings` 可以获得处理程序。通过查询Servlet安装的所有 `HandlerAdapter` 来查找支持该处理程序类的第一个 `HandlerAdapter`，从而获得 `HandlerAdapter` 。\n" +
">\n" +
"> 所有HTTP方法都由该方法处理。由 `HandlerAdapters` 或处理程序本身来决定可接受的方法。\n" +
"\n" +
"这段文档注释几乎把 `DispatcherServlet` 的核心处理流程的前半部分都描述到位了。下面是方法实现：（关键步骤已在源码中标号）\n" +
"\n" +
"```java\n" +
"protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {\n" +
"    HttpServletRequest processedRequest = request;\n" +
"    HandlerExecutionChain mappedHandler = null;\n" +
"    boolean multipartRequestParsed = false;\n" +
"\n" +
"    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);\n" +
"\n" +
"    try {\n" +
"        ModelAndView mv = null;\n" +
"        Exception dispatchException = null;\n" +
"\n" +
"        try {\n" +
"            // 5.1 文件上传解析\n" +
"            processedRequest = checkMultipart(request);\n" +
"            multipartRequestParsed = (processedRequest != request);\n" +
"\n" +
"            // Determine handler for the current request.\n" +
"            // 5.2 获取Handler，Handler中包含真正地处理器（Controller中的方法）和一组HandlerInterceptor拦截器\n" +
"            mappedHandler = getHandler(processedRequest);\n" +
"            if (mappedHandler == null) {\n" +
"                noHandlerFound(processedRequest, response);\n" +
"                return;\n" +
"            }\n" +
"\n" +
"            // Determine handler adapter for the current request.\n" +
"            // 5.3 获取HandlerAdapter\n" +
"            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());\n" +
"\n" +
"            // Process last-modified header, if supported by the handler.\n" +
"            String method = request.getMethod();\n" +
"            boolean isGet = \"GET\".equals(method);\n" +
"            if (isGet || \"HEAD\".equals(method)) {\n" +
"                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());\n" +
"                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {\n" +
"                    return;\n" +
"                }\n" +
"            }\n" +
"\n" +
"            // 5.4 回调拦截器\n" +
"            if (!mappedHandler.applyPreHandle(processedRequest, response)) {\n" +
"                return;\n" +
"            }\n" +
"\n" +
"            // Actually invoke the handler.\n" +
"            // 5.5 执行Handler，返回ModelAndView\n" +
"            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());\n" +
"\n" +
"            if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"                return;\n" +
"            }\n" +
"\n" +
"            applyDefaultViewName(processedRequest, mv);\n" +
"            // 5.6 回调拦截器\n" +
"            mappedHandler.applyPostHandle(processedRequest, response, mv);\n" +
"        }\n" +
"        catch (Exception ex) {\n" +
"            dispatchException = ex;\n" +
"        }\n" +
"        catch (Throwable err) {\n" +
"            // As of 4.3, we're processing Errors thrown from handler methods as well,\n" +
"            // making them available for @ExceptionHandler methods and other scenarios.\n" +
"            dispatchException = new NestedServletException(\"Handler dispatch failed\", err);\n" +
"        }\n" +
"        // 5.7 处理视图，解析异常\n" +
"        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);\n" +
"    }\n" +
"    catch (Exception ex) {\n" +
"        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);\n" +
"    }\n" +
"    catch (Throwable err) {\n" +
"        triggerAfterCompletion(processedRequest, response, mappedHandler,\n" +
"                new NestedServletException(\"Handler processing failed\", err));\n" +
"    }\n" +
"    finally {\n" +
"        if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"            // Instead of postHandle and afterCompletion\n" +
"            if (mappedHandler != null) {\n" +
"                // 5.8 回调拦截器\n" +
"                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);\n" +
"            }\n" +
"        }\n" +
"        else {\n" +
"            // Clean up any resources used by a multipart request.\n" +
"            if (multipartRequestParsed) {\n" +
"                cleanupMultipart(processedRequest);\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"下面咱分步骤来看，体会步骤的执行流程：\n" +
"\n" +
"### 5.1 checkMultipart：文件上传解析\n" +
"\n" +
"```java\n" +
"protected HttpServletRequest checkMultipart(HttpServletRequest request) throws MultipartException {\n" +
"    if (this.multipartResolver != null && this.multipartResolver.isMultipart(request)) {\n" +
"        if (WebUtils.getNativeRequest(request, MultipartHttpServletRequest.class) != null) {\n" +
"            if (request.getDispatcherType().equals(DispatcherType.REQUEST)) {\n" +
"                logger.trace(\"Request already resolved to MultipartHttpServletRequest, e.g. by MultipartFilter\");\n" +
"            }\n" +
"        }\n" +
"        else if (hasMultipartException(request)) {\n" +
"            logger.debug(\"Multipart resolution previously failed for current request - \" +\n" +
"                    \"skipping re-resolution for undisturbed error rendering\");\n" +
"        }\n" +
"        else {\n" +
"            try {\n" +
"                return this.multipartResolver.resolveMultipart(request);\n" +
"            }\n" +
"            catch (MultipartException ex) {\n" +
"                if (request.getAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE) != null) {\n" +
"                    logger.debug(\"Multipart resolution failed for error dispatch\", ex);\n" +
"                    // Keep processing error dispatch with regular request handle below\n" +
"                }\n" +
"                else {\n" +
"                    throw ex;\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    // If not returned before: return original request.\n" +
"    return request;\n" +
"}\n" +
"```\n" +
"\n" +
"上面的源码逻辑比较简单，它要判断当前是否有可以处理 Multipart 类型的 Resolver，并且判断当前 request 是否为 `MultipartRequest` ，最终会执行 `multipartResolver.resolveMultipart` 方法。\n" +
"\n" +
"#### 5.1.1 multipartResolver.resolveMultipart\n" +
"\n" +
"根据Debug发现`multipartResolver` 的类型是 `StandardServletMultipartResolver` ，翻看它的 `resolveMultipart` 方法：\n" +
"\n" +
"```java\n" +
"public MultipartHttpServletRequest resolveMultipart(HttpServletRequest request) throws MultipartException {\n" +
"    return new StandardMultipartHttpServletRequest(request, this.resolveLazily);\n" +
"}\n" +
"```\n" +
"\n" +
"它直接创建了一个 `StandardMultipartHttpServletRequest` ，那它跟普通的 `HttpServletRequest` 有什么扩展的地方呢？\n" +
"\n" +
"#### 5.1.2 StandardMultipartHttpServletRequest\n" +
"\n" +
"它上面只是调了个构造方法而已，那构造方法中大概率会有扩展部分：\n" +
"\n" +
"```java\n" +
"public StandardMultipartHttpServletRequest(HttpServletRequest request, boolean lazyParsing)\n" +
"        throws MultipartException {\n" +
"    super(request);\n" +
"    if (!lazyParsing) {\n" +
"        parseRequest(request);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"它这里有个 `parseRequest` 方法：\n" +
"\n" +
"```java\n" +
"private void parseRequest(HttpServletRequest request) {\n" +
"    try {\n" +
"        Collection<Part> parts = request.getParts();\n" +
"        this.multipartParameterNames = new LinkedHashSet<>(parts.size());\n" +
"        MultiValueMap<String, MultipartFile> files = new LinkedMultiValueMap<>(parts.size());\n" +
"        for (Part part : parts) {\n" +
"            String headerValue = part.getHeader(HttpHeaders.CONTENT_DISPOSITION);\n" +
"            ContentDisposition disposition = ContentDisposition.parse(headerValue);\n" +
"            String filename = disposition.getFilename();\n" +
"            if (filename != null) {\n" +
"                if (filename.startsWith(\"=?\") && filename.endsWith(\"?=\")) {\n" +
"                    filename = MimeDelegate.decode(filename);\n" +
"                }\n" +
"                files.add(part.getName(), new StandardMultipartFile(part, filename));\n" +
"            }\n" +
"            else {\n" +
"                this.multipartParameterNames.add(part.getName());\n" +
"            }\n" +
"        }\n" +
"        setMultipartFiles(files);\n" +
"    }\n" +
"    catch (Throwable ex) {\n" +
"        handleParseFailure(ex);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现到这里开始解析 `MultipartRequest` 中的文件了。由于咱测试的是GET请求页面跳转，这部分就不展开描述了，感兴趣的小伙伴可以写一个POST表单来测一下这部分是如何解析上传文件的。\n" +
"\n" +
"### 5.2 getHandler：搜索第一个可用的Handler\n" +
"\n" +
"```java\n" +
"    processedRequest = checkMultipart(request);\n" +
"    multipartRequestParsed = (processedRequest != request);\n" +
"\n" +
"    // Determine handler for the current request.\n" +
"    mappedHandler = getHandler(processedRequest);\n" +
"    // ......\n" +
"```\n" +
"\n" +
"文件解析完毕后，下一步就要获取处理器映射器了。\n" +
"\n" +
"```java\n" +
"protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {\n" +
"    if (this.handlerMappings != null) {\n" +
"        for (HandlerMapping mapping : this.handlerMappings) {\n" +
"            HandlerExecutionChain handler = mapping.getHandler(request);\n" +
"            if (handler != null) {\n" +
"                return handler;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    return null;\n" +
"}\n" +
"```\n" +
"\n" +
"可以很明显的看出，这部分是要从所有 的`HandlerMapping` 组件中选择一个能适配当前 **uri** 的，并组合请求的核心处理方法（`Controller`）和拦截器，返回给 `DispatcherServlet` 。这个方法的核心是 `mapping.getHandler` ，而所有的 `HandlerMapping` 都继承自 `AbstractHandlerMapping` ，`getHandler` 方法也只在 `AbstractHandlerMapping` 中定义：\n" +
"\n" +
"```java\n" +
"public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {\n" +
"    // 【核心】5.2.1 获得处理器映射器\n" +
"    Object handler = getHandlerInternal(request);\n" +
"    if (handler == null) {\n" +
"        handler = getDefaultHandler();\n" +
"    }\n" +
"    if (handler == null) {\n" +
"        return null;\n" +
"    }\n" +
"    // Bean name or resolved handler?\n" +
"    // 如果取到的Handler是一个String，则会认为要从IOC容器中获得对应的Bean\n" +
"    if (handler instanceof String) {\n" +
"        String handlerName = (String) handler;\n" +
"        handler = obtainApplicationContext().getBean(handlerName);\n" +
"    }\n" +
"\n" +
"    // 5.2.2 获得拦截器链\n" +
"    HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);\n" +
"\n" +
"    if (logger.isTraceEnabled()) {\n" +
"        logger.trace(\"Mapped to \" + handler);\n" +
"    }\n" +
"    else if (logger.isDebugEnabled() && !request.getDispatcherType().equals(DispatcherType.ASYNC)) {\n" +
"        logger.debug(\"Mapped to \" + executionChain.getHandler());\n" +
"    }\n" +
"\n" +
"    // 处理跨域\n" +
"    if (CorsUtils.isCorsRequest(request)) {\n" +
"        CorsConfiguration globalConfig = this.corsConfigurationSource.getCorsConfiguration(request);\n" +
"        CorsConfiguration handlerConfig = getCorsConfiguration(handler, request);\n" +
"        CorsConfiguration config = (globalConfig != null ? globalConfig.combine(handlerConfig) : handlerConfig);\n" +
"        executionChain = getCorsHandlerExecutionChain(request, executionChain, config);\n" +
"    }\n" +
"\n" +
"    return executionChain;\n" +
"}\n" +
"```\n" +
"\n" +
"这个方法的第一步就要先根据 **uri** 获取能处理它的 `Handler` ，之后拿这个 `handler` 跟一组拦截器组合形成 `HandlerExecutionChain` ，最后处理跨域情况。首先进入 `getHandlerInternal` 方法：\n" +
"\n" +
"#### 5.2.1 getHandlerInternal\n" +
"\n" +
"对于解析普通请求 uri 的，都会跳转到 `AbstractHandlerMethodMapping` 中：\n" +
"\n" +
"```java\n" +
"protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {\n" +
"    // 获取要搜索的uri\n" +
"    String lookupPath = getUrlPathHelper().getLookupPathForRequest(request);\n" +
"    // 加锁处理\n" +
"    this.mappingRegistry.acquireReadLock();\n" +
"    try {\n" +
"        // 5.2.1.1 搜索处理器方法（真正处理请求的RequestMapping）\n" +
"        HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);\n" +
"        // 5.2.1.2 将方法分离出来，单独形成一个Bean\n" +
"        return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);\n" +
"    }\n" +
"    finally {\n" +
"        this.mappingRegistry.releaseReadLock();\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"上面解析好本次请求的uri后，加锁处理，接下来进入try块，开始真正的寻找能处理该请求的Controller方法，找到之后包装为一个单独的Bean。先看看搜索是怎么实现的：\n" +
"\n" +
"##### 5.2.1.1 lookupHandlerMethod\n" +
"\n" +
"```java\n" +
"protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) throws Exception {\n" +
"    List<Match> matches = new ArrayList<>();\n" +
"    // 根据uri获取对应的RequestMapping信息（T的类型为RequestMappingInfo）\n" +
"    List<T> directPathMatches = this.mappingRegistry.getMappingsByUrl(lookupPath);\n" +
"    if (directPathMatches != null) {\n" +
"        addMatchingMappings(directPathMatches, matches, request);\n" +
"    }\n" +
"    if (matches.isEmpty()) {\n" +
"        // No choice but to go through all mappings...\n" +
"        addMatchingMappings(this.mappingRegistry.getMappings().keySet(), matches, request);\n" +
"    }\n" +
"\n" +
"    // 排序选择最适合的Handler\n" +
"    if (!matches.isEmpty()) {\n" +
"        Comparator<Match> comparator = new MatchComparator(getMappingComparator(request));\n" +
"        matches.sort(comparator);\n" +
"        Match bestMatch = matches.get(0);\n" +
"        if (matches.size() > 1) {\n" +
"            if (logger.isTraceEnabled()) {\n" +
"                logger.trace(matches.size() + \" matching mappings: \" + matches);\n" +
"            }\n" +
"            if (CorsUtils.isPreFlightRequest(request)) {\n" +
"                return PREFLIGHT_AMBIGUOUS_MATCH;\n" +
"            }\n" +
"            Match secondBestMatch = matches.get(1);\n" +
"            if (comparator.compare(bestMatch, secondBestMatch) == 0) {\n" +
"                Method m1 = bestMatch.handlerMethod.getMethod();\n" +
"                Method m2 = secondBestMatch.handlerMethod.getMethod();\n" +
"                String uri = request.getRequestURI();\n" +
"                throw new IllegalStateException(\n" +
"                        \"Ambiguous handler methods mapped for '\" + uri + \"': {\" + m1 + \", \" + m2 + \"}\");\n" +
"            }\n" +
"        }\n" +
"        request.setAttribute(BEST_MATCHING_HANDLER_ATTRIBUTE, bestMatch.handlerMethod);\n" +
"        handleMatch(bestMatch.mapping, lookupPath, request);\n" +
"        return bestMatch.handlerMethod;\n" +
"    }\n" +
"    else {\n" +
"        return handleNoMatch(this.mappingRegistry.getMappings().keySet(), lookupPath, request);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"在走完第二行时，从 `mappingRegistry` 中取出所有 Mapping 后，通过Debug发现已经能看到所有映射好的路径和对应的 Controller 中方法了。\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b6c55766f18~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"之后的部分要根据所有能匹配上的 Handler ，选择一个最适合的，最后返回出去。具体的思路小册不详细展开了，逻辑不算复杂，小伙伴们可以实际的测试一次来Debug走一遍，大概有个印象即可，实际开发中也不会说两个Controller方法处理一个 `url+method` 。\n" +
"\n" +
"##### 5.2.1.2 handlerMethod.createWithResolvedBean\n" +
"\n" +
"```java\n" +
"    try {\n" +
"        HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);\n" +
"        return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);\n" +
"    }\n" +
"```\n" +
"\n" +
"搜索到最适合的 `HandlerMethod` 后，要处理 `handlerMethod` 对象中封装的 bean 属性为 `beanName` 时的特殊情况：\n" +
"\n" +
"```java\n" +
"public HandlerMethod createWithResolvedBean() {\n" +
"    Object handler = this.bean;\n" +
"    if (this.bean instanceof String) {\n" +
"        Assert.state(this.beanFactory != null, \"Cannot resolve bean name without BeanFactory\");\n" +
"        String beanName = (String) this.bean;\n" +
"        handler = this.beanFactory.getBean(beanName);\n" +
"    }\n" +
"    return new HandlerMethod(this, handler);\n" +
"}\n" +
"```\n" +
"\n" +
"这里面的处理逻辑也很简单，它会判断当前 `handlerMethod` 的 bean 属性是否为 `String`，如果是，会从IOC容器中找到这个 `beanName` 对应的Bean，之后走下面的return，new出来一个 `HandlerMethod` 对象。值得注意的是，这个构造方法中保存的属性比较多：\n" +
"\n" +
"```java\n" +
"private HandlerMethod(HandlerMethod handlerMethod, Object handler) {\n" +
"    Assert.notNull(handlerMethod, \"HandlerMethod is required\");\n" +
"    Assert.notNull(handler, \"Handler object is required\");\n" +
"    this.bean = handler;\n" +
"    this.beanFactory = handlerMethod.beanFactory;\n" +
"    this.beanType = handlerMethod.beanType;\n" +
"    this.method = handlerMethod.method;\n" +
"    this.bridgedMethod = handlerMethod.bridgedMethod;\n" +
"    this.parameters = handlerMethod.parameters;\n" +
"    this.responseStatus = handlerMethod.responseStatus;\n" +
"    this.responseStatusReason = handlerMethod.responseStatusReason;\n" +
"    this.resolvedFromHandlerMethod = handlerMethod;\n" +
"}\n" +
"```\n" +
"\n" +
"这基本上把能存的都存好了。至此我们发现，`getHandlerInternal` 方法完成的工作是**将可以处理当前请求的 Controller 方法找出来，封装成一个 `HandlerMethod` 对象**。\n" +
"\n" +
"#### 5.2.2 getHandlerExecutionChain\n" +
"\n" +
"```java\n" +
"HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);\n" +
"```\n" +
"\n" +
"HandlerMethod 获取到之后，下一步还需要组合所有可以作用于当前请求的拦截器（这个思想很类似于AOP中对Bean的后置处理，产生代理对象）：\n" +
"\n" +
"```java\n" +
"protected HandlerExecutionChain getHandlerExecutionChain(Object handler, HttpServletRequest request) {\n" +
"    HandlerExecutionChain chain = (handler instanceof HandlerExecutionChain ?\n" +
"            (HandlerExecutionChain) handler : new HandlerExecutionChain(handler));\n" +
"\n" +
"    String lookupPath = this.urlPathHelper.getLookupPathForRequest(request);\n" +
"    for (HandlerInterceptor interceptor : this.adaptedInterceptors) {\n" +
"        if (interceptor instanceof MappedInterceptor) {\n" +
"            MappedInterceptor mappedInterceptor = (MappedInterceptor) interceptor;\n" +
"            if (mappedInterceptor.matches(lookupPath, this.pathMatcher)) {\n" +
"                chain.addInterceptor(mappedInterceptor.getInterceptor());\n" +
"            }\n" +
"        }\n" +
"        else {\n" +
"            chain.addInterceptor(interceptor);\n" +
"        }\n" +
"    }\n" +
"    return chain;\n" +
"}\n" +
"```\n" +
"\n" +
"这一步的思路也比较简单，它会把所有的拦截器都取出来，并且匹配是否为 `MappedInterceptor` 类型，还要匹配是否能处理当前请求 **uri** ，逻辑不很复杂。至于这里面的关键类 `HandlerExecutionChain` ，咱到后面执行的时候再看。\n" +
"\n" +
"### 5.3 getHandlerAdapter：根据Handler找对应的Adapter\n" +
"\n" +
"```java\n" +
"    mappedHandler = getHandler(processedRequest);\n" +
"    if (mappedHandler == null) {\n" +
"        noHandlerFound(processedRequest, response);\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    // Determine handler adapter for the current request.\n" +
"    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());\n" +
"```\n" +
"\n" +
"上一步确定好真正能处理当前请求的 `Controller` 和对应的方法后，接下来要借助 `HandlerAdapter` 来找到对应的这个 `Controller` 和方法：\n" +
"\n" +
"```java\n" +
"protected HandlerAdapter getHandlerAdapter(Object handler) throws ServletException {\n" +
"    if (this.handlerAdapters != null) {\n" +
"        for (HandlerAdapter adapter : this.handlerAdapters) {\n" +
"            // 5.3.1 判断是否能处理当前Handler\n" +
"            if (adapter.supports(handler)) {\n" +
"                return adapter;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    throw new ServletException(\"No adapter for handler [\" + handler +\n" +
"            \"]: The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler\");\n" +
"}\n" +
"```\n" +
"\n" +
"逻辑也很简单，它会找所有的 `HandlerAdapter` ，来判断谁能处理当前的 `handler` 。当进入该方法时，发现当前一共有3个 `HandlerAdapter`：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b6e3f574bf5~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"这里面判断是否能处理，核心方法是 `adapter.supports` ：\n" +
"\n" +
"#### 5.3.1 adapter.supports\n" +
"\n" +
"咱直接进到 `DemoController` 的这个 `Handler` 吧，它的类型是 `RequestMappingHandlerAdapter` ，它的 `support` 方法来自父类 `AbstractHandlerMethodAdapter` ：\n" +
"\n" +
"```java\n" +
"public final boolean supports(Object handler) {\n" +
"    return (handler instanceof HandlerMethod && supportsInternal((HandlerMethod) handler));\n" +
"}\n" +
"\n" +
"protected boolean supportsInternal(HandlerMethod handlerMethod) {\n" +
"    return true;\n" +
"}\n" +
"```\n" +
"\n" +
"这个方法倒是简单，它只判断一下 `handler` 的类型是不是 `HandlerMethod` ，因为后面的 `supportsInternal` 方法稳定返回 **true** 。上面的截图中很明显 `handler` 是 `HandlerMethod` 类型，故这部分会直接返回当前 `DemoController` 对应的 `HandlerAdapter` 。\n" +
"\n" +
"### 5.4 applyPreHandle：执行Controller方法前回调拦截器\n" +
"\n" +
"```java\n" +
"    // Determine handler adapter for the current request.\n" +
"    HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());\n" +
"\n" +
"    // Process last-modified header, if supported by the handler.\n" +
"    // ......\n" +
"\n" +
"    if (!mappedHandler.applyPreHandle(processedRequest, response)) {\n" +
"        return;\n" +
"    }\n" +
"```\n" +
"\n" +
"上面取到 `adapter` 后，先不着急用它，先把 `handler` 中的拦截器都调一遍：\n" +
"\n" +
"```java\n" +
"boolean applyPreHandle(HttpServletRequest request, HttpServletResponse response) throws Exception {\n" +
"    HandlerInterceptor[] interceptors = getInterceptors();\n" +
"    if (!ObjectUtils.isEmpty(interceptors)) {\n" +
"        for (int i = 0; i < interceptors.length; i++) {\n" +
"            HandlerInterceptor interceptor = interceptors[i];\n" +
"            if (!interceptor.preHandle(request, response, this.handler)) {\n" +
"                triggerAfterCompletion(request, response, null);\n" +
"                return false;\n" +
"            }\n" +
"            this.interceptorIndex = i;\n" +
"        }\n" +
"    }\n" +
"    return true;\n" +
"}\n" +
"```\n" +
"\n" +
"第一行先取出所有的拦截器，通过Debug发现此时有两个拦截器：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b702f231834~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"接下来的逻辑就是取到拦截器，回调 `preHandle` 方法，如果拦截器返回true，代表继续向后执行剩余的拦截器；如果返回false，代表拦截器将该方法拦截，不执行后续的拦截器和 `Controller` 中的方法。这部分逻辑也比较简单，而且咱之前学SpringWebMvc时也了解拦截器这部分如何编写。\n" +
"\n" +
"下面看看这两个拦截器都是什么吧：\n" +
"\n" +
"#### 5.4.1 ConversionServiceExposingInterceptor\n" +
"\n" +
"文档注释原文翻译：\n" +
"\n" +
"> Interceptor that places the configured ConversionService in request scope so it's available during request processing. The request attribute name is \"org.springframework.core.convert.ConversionService\", the value of ConversionService.class.getName().\n" +
">\n" +
"> Mainly for use within JSP tags such as the spring:eval tag.\n" +
">\n" +
"> 将已配置的 `ConversionService` 放置在请求范围内的拦截器，以便在请求处理期间可用。请求属性名称是 `\" org.springframework.core.convert.ConversionService\"`，即 `ConversionService.class.getName()` 的值。\n" +
">\n" +
"> 主要用于 `spring:eval` 标签的使用。\n" +
"\n" +
"最后一句已经解释到位了，它是配个 `spring:eval` 标签用的，而且是在jsp页面里用的，SpringBoot 都默认不用jsp了，咱也不展开描述了。不过咱可以从类名上大概获取一个信息：`ConversionService` ，它跟类型转换有关系，了解到这里就可以了。\n" +
"\n" +
"#### 5.4.2 ResourceUrlProviderExposingInterceptor\n" +
"\n" +
"文档注释原文翻译：\n" +
"\n" +
"> An interceptor that exposes the ResourceUrlProvider instance it is configured with as a request attribute.\n" +
">\n" +
"> 该拦截器会将 `ResourceUrlProvider` 实例放入 request 的属性中。\n" +
"\n" +
"文档注释描述的也比较清楚，看一眼它的源码能更好的理解文档注释的含义：\n" +
"\n" +
"```java\n" +
"public static final String RESOURCE_URL_PROVIDER_ATTR = ResourceUrlProvider.class.getName();\n" +
"\n" +
"public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)\n" +
"        throws Exception {\n" +
"    try {\n" +
"        // 只是调了setAttribute而已\n" +
"        request.setAttribute(RESOURCE_URL_PROVIDER_ATTR, this.resourceUrlProvider);\n" +
"    }\n" +
"    catch (ResourceUrlEncodingFilter.LookupPathIndexException ex) {\n" +
"        throw new ServletRequestBindingException(ex.getMessage(), ex);\n" +
"    }\n" +
"    return true;\n" +
"}\n" +
"```\n" +
"\n" +
"### 5.5 【核心】ha.handle\n" +
"\n" +
"```java\n" +
"    if (!mappedHandler.applyPreHandle(processedRequest, response)) {\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    // Actually invoke the handler.\n" +
"    mv = ha.handle(processedRequest, response, mappedHandler.getHandler());\n" +
"```\n" +
"\n" +
"上面的拦截器都执行完了，下面要真正的拿 `HandlerAdapter` 来执行目标 `Controller` 的方法了。\n" +
"\n" +
"```java\n" +
"public final ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)\n" +
"        throws Exception {\n" +
"    return handleInternal(request, response, (HandlerMethod) handler);\n" +
"}\n" +
"```\n" +
"\n" +
"它会直接调用到 `handleInternal` 方法：\n" +
"\n" +
"#### 5.5.1 handleInternal\n" +
"\n" +
"```java\n" +
"protected ModelAndView handleInternal(HttpServletRequest request,\n" +
"        HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {\n" +
"    ModelAndView mav;\n" +
"    checkRequest(request);\n" +
"\n" +
"    // Execute invokeHandlerMethod in synchronized block if required.\n" +
"    // 同步Session的配置\n" +
"    if (this.synchronizeOnSession) {\n" +
"        HttpSession session = request.getSession(false);\n" +
"        if (session != null) {\n" +
"            Object mutex = WebUtils.getSessionMutex(session);\n" +
"            synchronized (mutex) {\n" +
"                mav = invokeHandlerMethod(request, response, handlerMethod);\n" +
"            }\n" +
"        }\n" +
"        else {\n" +
"            // No HttpSession available -> no mutex necessary\n" +
"            mav = invokeHandlerMethod(request, response, handlerMethod);\n" +
"        }\n" +
"    }\n" +
"    else {\n" +
"        // No synchronization on session demanded at all...\n" +
"        // 默认不同步，直接走invokeHandlerMethod方法\n" +
"        mav = invokeHandlerMethod(request, response, handlerMethod);\n" +
"    }\n" +
"\n" +
"    if (!response.containsHeader(HEADER_CACHE_CONTROL)) {\n" +
"        if (getSessionAttributesHandler(handlerMethod).hasSessionAttributes()) {\n" +
"            applyCacheSeconds(response, this.cacheSecondsForSessionAttributeHandlers);\n" +
"        }\n" +
"        else {\n" +
"            prepareResponse(response);\n" +
"        }\n" +
"    }\n" +
"    return mav;\n" +
"}\n" +
"```\n" +
"\n" +
"这部分动作中有对 Session 同步的内容，咱暂且不关心，在一般情况下都会直接来到else中执行 `invokeHandlerMethod` 方法：\n" +
"\n" +
"#### 5.5.2 invokeHandlerMethod\n" +
"\n" +
"（关键步骤的注释已标注在源码中）\n" +
"\n" +
"```java\n" +
"protected ModelAndView invokeHandlerMethod(HttpServletRequest request,\n" +
"        HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {\n" +
"\n" +
"    ServletWebRequest webRequest = new ServletWebRequest(request, response);\n" +
"    try {\n" +
"        // 5.5.2.1 参数绑定器初始化\n" +
"        WebDataBinderFactory binderFactory = getDataBinderFactory(handlerMethod);\n" +
"        // 5.5.2.2 参数预绑定\n" +
"        ModelFactory modelFactory = getModelFactory(handlerMethod, binderFactory);\n" +
"\n" +
"        // 5.5.2.3 创建方法执行对象\n" +
"        ServletInvocableHandlerMethod invocableMethod = createInvocableHandlerMethod(handlerMethod);\n" +
"        if (this.argumentResolvers != null) {\n" +
"            invocableMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);\n" +
"        }\n" +
"        if (this.returnValueHandlers != null) {\n" +
"            invocableMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);\n" +
"        }\n" +
"        invocableMethod.setDataBinderFactory(binderFactory);\n" +
"        invocableMethod.setParameterNameDiscoverer(this.parameterNameDiscoverer);\n" +
"\n" +
"        // 创建ModelAndView的容器\n" +
"        ModelAndViewContainer mavContainer = new ModelAndViewContainer();\n" +
"        mavContainer.addAllAttributes(RequestContextUtils.getInputFlashMap(request));\n" +
"        modelFactory.initModel(webRequest, mavContainer, invocableMethod);\n" +
"        mavContainer.setIgnoreDefaultModelOnRedirect(this.ignoreDefaultModelOnRedirect);\n" +
"\n" +
"        AsyncWebRequest asyncWebRequest = WebAsyncUtils.createAsyncWebRequest(request, response);\n" +
"        asyncWebRequest.setTimeout(this.asyncRequestTimeout);\n" +
"\n" +
"        // 处理异步请求\n" +
"        WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);\n" +
"        asyncManager.setTaskExecutor(this.taskExecutor);\n" +
"        asyncManager.setAsyncWebRequest(asyncWebRequest);\n" +
"        asyncManager.registerCallableInterceptors(this.callableInterceptors);\n" +
"        asyncManager.registerDeferredResultInterceptors(this.deferredResultInterceptors);\n" +
"\n" +
"        if (asyncManager.hasConcurrentResult()) {\n" +
"            Object result = asyncManager.getConcurrentResult();\n" +
"            mavContainer = (ModelAndViewContainer) asyncManager.getConcurrentResultContext()[0];\n" +
"            asyncManager.clearConcurrentResult();\n" +
"            LogFormatUtils.traceDebug(logger, traceOn -> {\n" +
"                String formatted = LogFormatUtils.formatValue(result, !traceOn);\n" +
"                return \"Resume with async result [\" + formatted + \"]\";\n" +
"            });\n" +
"            invocableMethod = invocableMethod.wrapConcurrentResult(result);\n" +
"        }\n" +
"\n" +
"        // 5.5.3 执行Controller的方法\n" +
"        invocableMethod.invokeAndHandle(webRequest, mavContainer);\n" +
"        if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"            return null;\n" +
"        }\n" +
"\n" +
"        // 包装ModelAndView\n" +
"        return getModelAndView(mavContainer, modelFactory, webRequest);\n" +
"    }\n" +
"    finally {\n" +
"        webRequest.requestCompleted();\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"中间几个步骤展开来看：\n" +
"\n" +
"##### 5.5.2.1 getDataBinderFactory：参数绑定器初始化\n" +
"\n" +
"```java\n" +
"public static final MethodFilter INIT_BINDER_METHODS = method ->\n" +
"        AnnotatedElementUtils.hasAnnotation(method, InitBinder.class);\n" +
"\n" +
"private WebDataBinderFactory getDataBinderFactory(HandlerMethod handlerMethod) throws Exception {\n" +
"    Class<?> handlerType = handlerMethod.getBeanType();\n" +
"    Set<Method> methods = this.initBinderCache.get(handlerType);\n" +
"    if (methods == null) {\n" +
"        // 方法过滤\n" +
"        methods = MethodIntrospector.selectMethods(handlerType, INIT_BINDER_METHODS);\n" +
"        this.initBinderCache.put(handlerType, methods);\n" +
"    }\n" +
"    List<InvocableHandlerMethod> initBinderMethods = new ArrayList<>();\n" +
"    // Global methods first\n" +
"    this.initBinderAdviceCache.forEach((clazz, methodSet) -> {\n" +
"        if (clazz.isApplicableToBeanType(handlerType)) {\n" +
"            Object bean = clazz.resolveBean();\n" +
"            for (Method method : methodSet) {\n" +
"                initBinderMethods.add(createInitBinderMethod(bean, method));\n" +
"            }\n" +
"        }\n" +
"    });\n" +
"    for (Method method : methods) {\n" +
"        Object bean = handlerMethod.getBean();\n" +
"        initBinderMethods.add(createInitBinderMethod(bean, method));\n" +
"    }\n" +
"    return createDataBinderFactory(initBinderMethods);\n" +
"}\n" +
"```\n" +
"\n" +
"注意最上面 `INIT_BINDER_METHODS` 的判断规则是方法上是否有 `@InitBinder` 注解。\n" +
"\n" +
"看方法实现，这个方法会拿一个 `MethodFilter` ，去准备执行的 `Controller` 中寻找有没有提前显式绑定参数的方法。过滤的方法调用在第一个if结构中的 `MethodIntrospector.selectMethods` 。其实从这里来看，就已经明白这一步的规则了，**它会预初始化这个 `Controller` 中的一个 `WebDataBinder` ，来对这个控制器中的数据绑定器做定制修改**。通常情况下我们不会操作 `WebDataBinder` ，此处不会有动作发生，直接返回。\n" +
"\n" +
"（如果小伙伴对 `WebDataBinder` 和 `@InitBinder` 不了解，可以借助搜索引擎查阅一些资料，小册不再展开介绍）\n" +
"\n" +
"##### 5.5.2.2 getModelFactory：参数预绑定\n" +
"\n" +
"```java\n" +
"public static final MethodFilter MODEL_ATTRIBUTE_METHODS = method ->\n" +
"        (!AnnotatedElementUtils.hasAnnotation(method, RequestMapping.class) &&\n" +
"                AnnotatedElementUtils.hasAnnotation(method, ModelAttribute.class));\n" +
"\n" +
"private ModelFactory getModelFactory(HandlerMethod handlerMethod, WebDataBinderFactory binderFactory) {\n" +
"    SessionAttributesHandler sessionAttrHandler = getSessionAttributesHandler(handlerMethod);\n" +
"    Class<?> handlerType = handlerMethod.getBeanType();\n" +
"    Set<Method> methods = this.modelAttributeCache.get(handlerType);\n" +
"    if (methods == null) {\n" +
"        methods = MethodIntrospector.selectMethods(handlerType, MODEL_ATTRIBUTE_METHODS);\n" +
"        this.modelAttributeCache.put(handlerType, methods);\n" +
"    }\n" +
"    List<InvocableHandlerMethod> attrMethods = new ArrayList<>();\n" +
"    // Global methods first\n" +
"    this.modelAttributeAdviceCache.forEach((clazz, methodSet) -> {\n" +
"        if (clazz.isApplicableToBeanType(handlerType)) {\n" +
"            Object bean = clazz.resolveBean();\n" +
"            for (Method method : methodSet) {\n" +
"                attrMethods.add(createModelAttributeMethod(binderFactory, bean, method));\n" +
"            }\n" +
"        }\n" +
"    });\n" +
"    for (Method method : methods) {\n" +
"        Object bean = handlerMethod.getBean();\n" +
"        attrMethods.add(createModelAttributeMethod(binderFactory, bean, method));\n" +
"    }\n" +
"    return new ModelFactory(attrMethods, binderFactory, sessionAttrHandler);\n" +
"}\n" +
"```\n" +
"\n" +
"如果只是看方法实现，那思路几乎跟上面一样，但注意看这一次的过滤器 `MODEL_ATTRIBUTE_METHODS`：它要确定那些 **不带 `@RequestMapping` 但带 `@ModelAttribute` 的方法**。这个在 SpringWebMvc 中也有初始化的作用：**进入 `Controller` 的指定方法之前，标有 `@ModelAttribute` 注解的方法会先执行**。\n" +
"\n" +
"（如果小伙伴对 `@ModelAttribute` 不太了解，可以借助搜索引擎查阅一些资料，实际动手写一些简单Demo体会一下作用，小册不再展开介绍）\n" +
"\n" +
"##### 5.5.2.3 createInvocableHandlerMethod：创建方法执行对象\n" +
"\n" +
"```java\n" +
"protected ServletInvocableHandlerMethod createInvocableHandlerMethod(HandlerMethod handlerMethod) {\n" +
"    return new ServletInvocableHandlerMethod(handlerMethod);\n" +
"}\n" +
"```\n" +
"\n" +
"可以看出只是将 `HandlerMethod` 封装为 `ServletInvocableHandlerMethod` 而已，它封装的目的是为了下面能执行重写的 `invokeAndHandle` 方法。\n" +
"\n" +
"------\n" +
"\n" +
"上面的方法（参数预绑定，异步处理等）都执行完毕后，来到 `invokeAndHandle` 方法：\n" +
"\n" +
"#### 5.5.3 invocableMethod.invokeAndHandle\n" +
"\n" +
"先暂且不看下面的源码，第一句就是重点：\n" +
"\n" +
"```java\n" +
"public void invokeAndHandle(ServletWebRequest webRequest, ModelAndViewContainer mavContainer,\n" +
"        Object... providedArgs) throws Exception {\n" +
"    // 5.5.4 反射调用\n" +
"    Object returnValue = invokeForRequest(webRequest, mavContainer, providedArgs);\n" +
"    // ......\n" +
"}\n" +
"```\n" +
"\n" +
"#### 5.5.4 invokeForRequest\n" +
"\n" +
"```java\n" +
"public Object invokeForRequest(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer,\n" +
"        Object... providedArgs) throws Exception {\n" +
"    Object[] args = getMethodArgumentValues(request, mavContainer, providedArgs);\n" +
"    if (logger.isTraceEnabled()) {\n" +
"        logger.trace(\"Arguments: \" + Arrays.toString(args));\n" +
"    }\n" +
"    return doInvoke(args);\n" +
"}\n" +
"```\n" +
"\n" +
"这个方法分为两步：参数取值，反射调用 `Controller` 。其中参数取值和类型转换的过程从 `getMethodArgumentValues` 方法开始：\n" +
"\n" +
"##### 5.5.4.1 getMethodArgumentValues\n" +
"\n" +
"（关键部分的注释已标注在源码中）\n" +
"\n" +
"```java\n" +
"protected Object[] getMethodArgumentValues(NativeWebRequest request, @Nullable ModelAndViewContainer mavContainer,\n" +
"        Object... providedArgs) throws Exception {\n" +
"    // 获取目标Controller中方法的参数类型\n" +
"    MethodParameter[] parameters = getMethodParameters();\n" +
"    if (ObjectUtils.isEmpty(parameters)) {\n" +
"        return EMPTY_ARGS;\n" +
"    }\n" +
"\n" +
"    Object[] args = new Object[parameters.length];\n" +
"    for (int i = 0; i < parameters.length; i++) {\n" +
"        MethodParameter parameter = parameters[i];\n" +
"        parameter.initParameterNameDiscovery(this.parameterNameDiscoverer);\n" +
"        // 获得参数值\n" +
"        args[i] = findProvidedArgument(parameter, providedArgs);\n" +
"        if (args[i] != null) {\n" +
"            continue;\n" +
"        }\n" +
"        // 5.5.4.2 判断参数解析器是否能处理当前参数类型\n" +
"        if (!this.resolvers.supportsParameter(parameter)) {\n" +
"            throw new IllegalStateException(formatArgumentError(parameter, \"No suitable resolver\"));\n" +
"        }\n" +
"        try {\n" +
"            // 5.5.4.3 参数可以被解析，将参数转换为Controller中目标方法对应位置的参数类型\n" +
"            args[i] = this.resolvers.resolveArgument(parameter, mavContainer, request, this.dataBinderFactory);\n" +
"        }\n" +
"        catch (Exception ex) {\n" +
"            // Leave stack trace for later, exception may actually be resolved and handled...\n" +
"            if (logger.isDebugEnabled()) {\n" +
"                String exMsg = ex.getMessage();\n" +
"                if (exMsg != null && !exMsg.contains(parameter.getExecutable().toGenericString())) {\n" +
"                    logger.debug(formatArgumentError(parameter, exMsg));\n" +
"                }\n" +
"            }\n" +
"            throw ex;\n" +
"        }\n" +
"    }\n" +
"    return args;\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现上面的思路还是比较清晰的，首先获取值，之后判断是否可以处理，如果可以，转换；解析不了，抛出异常。\n" +
"\n" +
"这里咱以一个实例来看：**String转int** 。\n" +
"\n" +
"##### 5.5.4.2 resolvers.supportsParameter：判断是否可以处理\n" +
"\n" +
"```java\n" +
"public boolean supportsParameter(MethodParameter parameter) {\n" +
"    return getArgumentResolver(parameter) != null;\n" +
"}\n" +
"\n" +
"private HandlerMethodArgumentResolver getArgumentResolver(MethodParameter parameter) {\n" +
"    HandlerMethodArgumentResolver result = this.argumentResolverCache.get(parameter);\n" +
"    if (result == null) {\n" +
"        for (HandlerMethodArgumentResolver resolver : this.argumentResolvers) {\n" +
"            if (resolver.supportsParameter(parameter)) {\n" +
"                result = resolver;\n" +
"                this.argumentResolverCache.put(parameter, result);\n" +
"                break;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    return result;\n" +
"}\n" +
"```\n" +
"\n" +
"这部分判断是否能处理当前参数，实际上就是把所有的 `HandlerMethodArgumentResolver` 都拿出来检验一遍，如果找到了能处理的，会将当前参数和对应的 `ArgumentResolver` 绑定起来，方便下一次快速获取。\n" +
"\n" +
"##### 5.5.4.3 resolvers.resolveArgument：转换参数\n" +
"\n" +
"参数确定好，接下来转换参数：\n" +
"\n" +
"```java\n" +
"public Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,\n" +
"        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {\n" +
"\n" +
"    HandlerMethodArgumentResolver resolver = getArgumentResolver(parameter);\n" +
"    if (resolver == null) {\n" +
"        throw new IllegalArgumentException(\"Unsupported parameter type [\" +\n" +
"                parameter.getParameterType().getName() + \"]. supportsParameter should be called first.\");\n" +
"    }\n" +
"    return resolver.resolveArgument(parameter, mavContainer, webRequest, binderFactory);\n" +
"}\n" +
"```\n" +
"\n" +
"上面取到前一步缓存的 `ArgumentResolver` （类型为 `RequestParamMethodArgumentResolver` ），去调它的 `resolveArgument` 方法：\n" +
"\n" +
"```java\n" +
"public final Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,\n" +
"        NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {\n" +
"\n" +
"    NamedValueInfo namedValueInfo = getNamedValueInfo(parameter);\n" +
"    MethodParameter nestedParameter = parameter.nestedIfOptional();\n" +
"\n" +
"    // 获取实际参数的key\n" +
"    Object resolvedName = resolveStringValue(namedValueInfo.name);\n" +
"    if (resolvedName == null) {\n" +
"        throw new IllegalArgumentException(\n" +
"                \"Specified name must not resolve to null: [\" + namedValueInfo.name + \"]\");\n" +
"    }\n" +
"\n" +
"    // 5.5.4.4 获取实际参数的值\n" +
"    Object arg = resolveName(resolvedName.toString(), nestedParameter, webRequest);\n" +
"    if (arg == null) {\n" +
"        if (namedValueInfo.defaultValue != null) {\n" +
"            arg = resolveStringValue(namedValueInfo.defaultValue);\n" +
"        }\n" +
"        else if (namedValueInfo.required && !nestedParameter.isOptional()) {\n" +
"            handleMissingValue(namedValueInfo.name, nestedParameter, webRequest);\n" +
"        }\n" +
"        arg = handleNullValue(namedValueInfo.name, arg, nestedParameter.getNestedParameterType());\n" +
"    }\n" +
"    else if (\"\".equals(arg) && namedValueInfo.defaultValue != null) {\n" +
"        arg = resolveStringValue(namedValueInfo.defaultValue);\n" +
"    }\n" +
"\n" +
"    if (binderFactory != null) {\n" +
"        WebDataBinder binder = binderFactory.createBinder(webRequest, null, namedValueInfo.name);\n" +
"        try {\n" +
"            // 5.5.4.5 参数类型转换\n" +
"            arg = binder.convertIfNecessary(arg, parameter.getParameterType(), parameter);\n" +
"        }\n" +
"        catch (ConversionNotSupportedException ex) {\n" +
"            throw new MethodArgumentConversionNotSupportedException(arg, ex.getRequiredType(),\n" +
"                    namedValueInfo.name, parameter, ex.getCause());\n" +
"        }\n" +
"        catch (TypeMismatchException ex) {\n" +
"            throw new MethodArgumentTypeMismatchException(arg, ex.getRequiredType(),\n" +
"                    namedValueInfo.name, parameter, ex.getCause());\n" +
"\n" +
"        }\n" +
"    }\n" +
"\n" +
"    handleResolvedValue(arg, namedValueInfo.name, parameter, mavContainer, webRequest);\n" +
"\n" +
"    return arg;\n" +
"}\n" +
"```\n" +
"\n" +
"方法实现中的大体思路也很清晰：先获取参数的key，后根据key获取value，最后拿value去做必要的类型转换。重要的两步是获取value和类型转换，分开来看：\n" +
"\n" +
"##### 5.5.4.4 resolveName：获取参数的值\n" +
"\n" +
"```java\n" +
"protected Object resolveName(String name, MethodParameter parameter, NativeWebRequest request) throws Exception {\n" +
"    HttpServletRequest servletRequest = request.getNativeRequest(HttpServletRequest.class);\n" +
"\n" +
"    if (servletRequest != null) {\n" +
"        Object mpArg = MultipartResolutionDelegate.resolveMultipartArgument(name, parameter, servletRequest);\n" +
"        if (mpArg != MultipartResolutionDelegate.UNRESOLVABLE) {\n" +
"            return mpArg;\n" +
"        }\n" +
"    }\n" +
"\n" +
"    Object arg = null;\n" +
"    MultipartRequest multipartRequest = request.getNativeRequest(MultipartRequest.class);\n" +
"    if (multipartRequest != null) {\n" +
"        List<MultipartFile> files = multipartRequest.getFiles(name);\n" +
"        if (!files.isEmpty()) {\n" +
"            arg = (files.size() == 1 ? files.get(0) : files);\n" +
"        }\n" +
"    }\n" +
"    if (arg == null) {\n" +
"        String[] paramValues = request.getParameterValues(name);\n" +
"        if (paramValues != null) {\n" +
"            arg = (paramValues.length == 1 ? paramValues[0] : paramValues);\n" +
"        }\n" +
"    }\n" +
"    return arg;\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现第一行和最后的一个if结构，是 `HttpServletRequest` 的原生API操作，可以由此取到参数的值。\n" +
"\n" +
"##### 5.5.4.5 binder.convertIfNecessary：参数类型转换\n" +
"\n" +
"```java\n" +
"public <T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType,\n" +
"        @Nullable MethodParameter methodParam) throws TypeMismatchException {\n" +
"    return getTypeConverter().convertIfNecessary(value, requiredType, methodParam);\n" +
"}\n" +
"\n" +
"public <T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType,\n" +
"        @Nullable MethodParameter methodParam) throws TypeMismatchException {\n" +
"    return convertIfNecessary(value, requiredType,\n" +
"            (methodParam != null ? new TypeDescriptor(methodParam) : TypeDescriptor.valueOf(requiredType)));\n" +
"}\n" +
"\n" +
"public <T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType,\n" +
"        @Nullable TypeDescriptor typeDescriptor) throws TypeMismatchException {\n" +
"    Assert.state(this.typeConverterDelegate != null, \"No TypeConverterDelegate\");\n" +
"    try {\n" +
"        return this.typeConverterDelegate.convertIfNecessary(null, null, value, requiredType, typeDescriptor);\n" +
"    }\n" +
"    catch (ConverterNotFoundException | IllegalStateException ex) {\n" +
"        throw new ConversionNotSupportedException(value, requiredType, ex);\n" +
"    }\n" +
"    catch (ConversionException | IllegalArgumentException ex) {\n" +
"        throw new TypeMismatchException(value, requiredType, ex);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"`binder` 的方法一路调到底下，它会利用 `typeConverterDelegate` 来做实际的参数类型转换。由于 `typeConverterDelegate` 中的参数转换逻辑很复杂，小册不作记录，小伙伴们可以借助IDE自行Debug体会一下参数转换的过程。\n" +
"\n" +
"------\n" +
"\n" +
"参数处理完成后，接下来就可以真正的调用 Controller 中的方法了：\n" +
"\n" +
"#### 5.5.5 【反射】doInvoke\n" +
"\n" +
"```java\n" +
"protected Object doInvoke(Object... args) throws Exception {\n" +
"    ReflectionUtils.makeAccessible(getBridgedMethod());\n" +
"    try {\n" +
"        return getBridgedMethod().invoke(getBean(), args);\n" +
"    }\n" +
"    // catch ......\n" +
"}\n" +
"```\n" +
"\n" +
"发现了原生的反射机制，这里会真正的执行 Controller 里的方法。\n" +
"\n" +
"#### 5.5.6 Controller执行完成后\n" +
"\n" +
"回到 `invocableMethod.invokeAndHandle` ：\n" +
"\n" +
"```java\n" +
"public void invokeAndHandle(ServletWebRequest webRequest, ModelAndViewContainer mavContainer,\n" +
"        Object... providedArgs) throws Exception {\n" +
"    Object returnValue = invokeForRequest(webRequest, mavContainer, providedArgs);\n" +
"    setResponseStatus(webRequest);\n" +
"\n" +
"    if (returnValue == null) {\n" +
"        if (isRequestNotModified(webRequest) || getResponseStatus() != null || mavContainer.isRequestHandled()) {\n" +
"            disableContentCachingIfNecessary(webRequest);\n" +
"            mavContainer.setRequestHandled(true);\n" +
"            return;\n" +
"        }\n" +
"    }\n" +
"    else if (StringUtils.hasText(getResponseStatusReason())) {\n" +
"        mavContainer.setRequestHandled(true);\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    mavContainer.setRequestHandled(false);\n" +
"    Assert.state(this.returnValueHandlers != null, \"No return value handlers\");\n" +
"    try {\n" +
"        // 5.5.6.1 处理返回值\n" +
"        this.returnValueHandlers.handleReturnValue(\n" +
"                returnValue, getReturnValueType(returnValue), mavContainer, webRequest);\n" +
"    }\n" +
"    catch (Exception ex) {\n" +
"        if (logger.isTraceEnabled()) {\n" +
"            logger.trace(formatErrorForReturnValue(returnValue), ex);\n" +
"        }\n" +
"        throw ex;\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"`Controller` 的目标方法执行完毕后，回到 `invokeAndHandle` 方法，\n" +
"\n" +
"##### 5.5.6.1 returnValueHandlers.handleReturnValue\n" +
"\n" +
"```java\n" +
"public void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,\n" +
"        ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception {\n" +
"    HandlerMethodReturnValueHandler handler = selectHandler(returnValue, returnType);\n" +
"    if (handler == null) {\n" +
"        throw new IllegalArgumentException(\"Unknown return value type: \" + returnType.getParameterType().getName());\n" +
"    }\n" +
"    handler.handleReturnValue(returnValue, returnType, mavContainer, webRequest);\n" +
"}\n" +
"```\n" +
"\n" +
"首先它会从所有的 `ReturnValueHandler` 中匹配一个最合适的来处理 `Controller` 的目标方法的返回值：\n" +
"\n" +
"```java\n" +
"private HandlerMethodReturnValueHandler selectHandler(@Nullable Object value, MethodParameter returnType) {\n" +
"    boolean isAsyncValue = isAsyncReturnValue(value, returnType);\n" +
"    for (HandlerMethodReturnValueHandler handler : this.returnValueHandlers) {\n" +
"        if (isAsyncValue && !(handler instanceof AsyncHandlerMethodReturnValueHandler)) {\n" +
"            continue;\n" +
"        }\n" +
"        if (handler.supportsReturnType(returnType)) {\n" +
"            return handler;\n" +
"        }\n" +
"    }\n" +
"    return null;\n" +
"}\n" +
"```\n" +
"\n" +
"通过Debug，发现如果返回视图，则会使用 `ViewNameMethodReturnValueHandler` 作为 `ReturnValueHandler` 。\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b72050c4e7e~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"##### 5.5.6.2 handler.handleReturnValue\n" +
"\n" +
"```java\n" +
"public void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,\n" +
"        ModelAndViewContainer mavContainer, NativeWebRequest webRequest) throws Exception {\n" +
"    if (returnValue instanceof CharSequence) {\n" +
"        String viewName = returnValue.toString();\n" +
"        mavContainer.setViewName(viewName);\n" +
"        if (isRedirectViewName(viewName)) {\n" +
"            mavContainer.setRedirectModelScenario(true);\n" +
"        }\n" +
"    }\n" +
"    else if (returnValue != null) {\n" +
"        // should not happen\n" +
"        throw new UnsupportedOperationException(\"Unexpected return type: \" +\n" +
"                returnType.getParameterType().getName() + \" in method: \" + returnType.getMethod());\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"这部分逻辑也很简单，它会判断返回值是否属于 `CharSequence` 类型，如果是，会给 `ModelAndViewContainer` 中设置 `viewName` 。\n" +
"\n" +
"#### 5.5.7 回到invokeHandlerMethod方法\n" +
"\n" +
"```java\n" +
"protected ModelAndView invokeHandlerMethod(HttpServletRequest request,\n" +
"        HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {\n" +
"    // ......\n" +
"        invocableMethod.invokeAndHandle(webRequest, mavContainer);\n" +
"        if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"            return null;\n" +
"        }\n" +
"\n" +
"        return getModelAndView(mavContainer, modelFactory, webRequest);\n" +
"    }\n" +
"    finally {\n" +
"        webRequest.requestCompleted();\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"回到 `invokeHandlerMethod` 后，最后一步就是获取 `ModelAndView` 了：\n" +
"\n" +
"```java\n" +
"private ModelAndView getModelAndView(ModelAndViewContainer mavContainer,\n" +
"        ModelFactory modelFactory, NativeWebRequest webRequest) throws Exception {\n" +
"\n" +
"    modelFactory.updateModel(webRequest, mavContainer);\n" +
"    if (mavContainer.isRequestHandled()) {\n" +
"        return null;\n" +
"    }\n" +
"    ModelMap model = mavContainer.getModel();\n" +
"    ModelAndView mav = new ModelAndView(mavContainer.getViewName(), model, mavContainer.getStatus());\n" +
"    if (!mavContainer.isViewReference()) {\n" +
"        mav.setView((View) mavContainer.getView());\n" +
"    }\n" +
"    if (model instanceof RedirectAttributes) {\n" +
"        Map<String, ?> flashAttributes = ((RedirectAttributes) model).getFlashAttributes();\n" +
"        HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);\n" +
"        if (request != null) {\n" +
"            RequestContextUtils.getOutputFlashMap(request).putAll(flashAttributes);\n" +
"        }\n" +
"    }\n" +
"    return mav;\n" +
"}\n" +
"```\n" +
"\n" +
"从方法实现中发现它其实底层也是现new出来的 `ModelAndView` 对象，之后把 `ModelAndViewContainer` 中的东西都设置到 `ModelAndView` 中，最后返回。\n" +
"\n" +
"#### 5.5.8 回到handleInternal方法\n" +
"\n" +
"```java\n" +
"protected static final String HEADER_CACHE_CONTROL = \"Cache-Control\";\n" +
"\n" +
"protected ModelAndView handleInternal(HttpServletRequest request,\n" +
"        HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {\n" +
"    // ......\n" +
"    else {\n" +
"        // No synchronization on session demanded at all...\n" +
"        mav = invokeHandlerMethod(request, response, handlerMethod);\n" +
"    }\n" +
"\n" +
"    if (!response.containsHeader(HEADER_CACHE_CONTROL)) {\n" +
"        if (getSessionAttributesHandler(handlerMethod).hasSessionAttributes()) {\n" +
"            applyCacheSeconds(response, this.cacheSecondsForSessionAttributeHandlers);\n" +
"        }\n" +
"        else {\n" +
"            prepareResponse(response);\n" +
"        }\n" +
"    }\n" +
"\n" +
"    return mav;\n" +
"}\n" +
"```\n" +
"\n" +
"方法执行完返回 `ModelAndView` 后，最后一步要根据 header 中是否有 `\"Cache-Control\"` 来决定最后的跳转。很明显默认请求下不会带缓存相关的请求头，进入最后一步 `prepareResponse` 方法：\n" +
"\n" +
"##### 5.5.8.1 prepareResponse\n" +
"\n" +
"```java\n" +
"protected final void prepareResponse(HttpServletResponse response) {\n" +
"    if (this.cacheControl != null) {\n" +
"        applyCacheControl(response, this.cacheControl);\n" +
"    }\n" +
"    else {\n" +
"        applyCacheSeconds(response, this.cacheSeconds);\n" +
"    }\n" +
"    if (this.varyByRequestHeaders != null) {\n" +
"        for (String value : getVaryRequestHeadersToAdd(response, this.varyByRequestHeaders)) {\n" +
"            response.addHeader(\"Vary\", value);\n" +
"        }\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现也是跟缓存相关的简单设置，逻辑很简单，不再深入研究。\n" +
"\n" +
"### 5.6 回到doDispatch\n" +
"\n" +
"```java\n" +
"protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {\n" +
"    // .....\n" +
"    try {\n" +
"            // ......\n" +
"            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());\n" +
"\n" +
"            if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"                return;\n" +
"            }\n" +
"\n" +
"            // 如果ModelAndView不为空，但viewName为空时，指定默认view的名称\n" +
"            applyDefaultViewName(processedRequest, mv);\n" +
"            mappedHandler.applyPostHandle(processedRequest, response, mv);\n" +
"        }\n" +
"    // ......\n" +
"}\n" +
"```\n" +
"\n" +
"在处理默认 viewName 后，下面会回调拦截器的 `postHandle` 方法：\n" +
"\n" +
"```java\n" +
"void applyPostHandle(HttpServletRequest request, HttpServletResponse response, @Nullable ModelAndView mv)\n" +
"        throws Exception {\n" +
"    HandlerInterceptor[] interceptors = getInterceptors();\n" +
"    if (!ObjectUtils.isEmpty(interceptors)) {\n" +
"        for (int i = interceptors.length - 1; i >= 0; i--) {\n" +
"            HandlerInterceptor interceptor = interceptors[i];\n" +
"            interceptor.postHandle(request, response, this.handler, mv);\n" +
"        }\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"### 5.7 processDispatchResult：处理视图，解析异常\n" +
"\n" +
"```java\n" +
"processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);\n" +
"```\n" +
"\n" +
"这一步算是 `doDispatch` 的最后一步：\n" +
"\n" +
"```java\n" +
"private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,\n" +
"        @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv,\n" +
"        @Nullable Exception exception) throws Exception {\n" +
"\n" +
"    boolean errorView = false;\n" +
"\n" +
"    // 5.7.1 如果有抛出异常，则根据异常的类型处理ModelAndView\n" +
"    if (exception != null) {\n" +
"        if (exception instanceof ModelAndViewDefiningException) {\n" +
"            logger.debug(\"ModelAndViewDefiningException encountered\", exception);\n" +
"            mv = ((ModelAndViewDefiningException) exception).getModelAndView();\n" +
"        }\n" +
"        else {\n" +
"            Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);\n" +
"            mv = processHandlerException(request, response, handler, exception);\n" +
"            errorView = (mv != null);\n" +
"        }\n" +
"    }\n" +
"\n" +
"    // Did the handler return a view to render?\n" +
"    if (mv != null && !mv.wasCleared()) {\n" +
"        // 5.7.2 渲染结果视图\n" +
"        render(mv, request, response);\n" +
"        if (errorView) {\n" +
"            WebUtils.clearErrorRequestAttributes(request);\n" +
"        }\n" +
"    }\n" +
"    else {\n" +
"        if (logger.isTraceEnabled()) {\n" +
"            logger.trace(\"No view rendering, null ModelAndView returned.\");\n" +
"        }\n" +
"    }\n" +
"\n" +
"    if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {\n" +
"        // Concurrent handling started during a forward\n" +
"        return;\n" +
"    }\n" +
"\n" +
"    if (mappedHandler != null) {\n" +
"        mappedHandler.triggerAfterCompletion(request, response, null);\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"这段源码主要分两部分：处理异常，渲染结果视图。分别来看：\n" +
"\n" +
"#### 5.7.1 处理异常\n" +
"\n" +
"修改测试Controller里的方法，加入一个除零异常，重新Debug后发现抛出的异常直到 `processDispatchResult` 方法传入时，还是刚抛出的 `ArithmeticException` ，它自然不属于 `ModelAndViewDefiningException` 类型，进入else：\n" +
"\n" +
"```java\n" +
"    Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);\n" +
"    mv = processHandlerException(request, response, handler, exception);\n" +
"    errorView = (mv != null);\n" +
"```\n" +
"\n" +
"上面先把出现异常的 Controller 和目标方法获取到，下面会根据这个异常来执行 `processHandlerException` 方法：\n" +
"\n" +
"```java\n" +
"protected ModelAndView processHandlerException(HttpServletRequest request, HttpServletResponse response,\n" +
"        @Nullable Object handler, Exception ex) throws Exception {\n" +
"\n" +
"    // Success and error responses may use different content types\n" +
"    request.removeAttribute(HandlerMapping.PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE);\n" +
"\n" +
"    // Check registered HandlerExceptionResolvers...\n" +
"    // 遍历所有可以处理异常的异常处理器\n" +
"    ModelAndView exMv = null;\n" +
"    if (this.handlerExceptionResolvers != null) {\n" +
"        for (HandlerExceptionResolver resolver : this.handlerExceptionResolvers) {\n" +
"            exMv = resolver.resolveException(request, response, handler, ex);\n" +
"            if (exMv != null) {\n" +
"                break;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    // 如果有成功处理，则返回异常视图\n" +
"    if (exMv != null) {\n" +
"        if (exMv.isEmpty()) {\n" +
"            request.setAttribute(EXCEPTION_ATTRIBUTE, ex);\n" +
"            return null;\n" +
"        }\n" +
"        // We might still need view name translation for a plain error model...\n" +
"        if (!exMv.hasView()) {\n" +
"            String defaultViewName = getDefaultViewName(request);\n" +
"            if (defaultViewName != null) {\n" +
"                exMv.setViewName(defaultViewName);\n" +
"            }\n" +
"        }\n" +
"        if (logger.isTraceEnabled()) {\n" +
"            logger.trace(\"Using resolved error view: \" + exMv, ex);\n" +
"        }\n" +
"        if (logger.isDebugEnabled()) {\n" +
"            logger.debug(\"Using resolved error view: \" + exMv);\n" +
"        }\n" +
"        WebUtils.exposeErrorRequestAttributes(request, ex, getServletName());\n" +
"        return exMv;\n" +
"    }\n" +
"\n" +
"    // 无法处理该异常，继续抛出\n" +
"    throw ex;\n" +
"}\n" +
"```\n" +
"\n" +
"默认情况下，如果没有额外注册异常处理器，IOC容器中只会有两个处理器：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b7439b14e1f~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"而且通过Debug，发现这两个 `ExceptionResolver` 都无法处理这个除零异常，最终到方法最底部继续 throw 出去。\n" +
"\n" +
"##### 5.7.1.1 手动注册一个异常处理器后的效果\n" +
"\n" +
"在测试工程中加入一个异常处理器：\n" +
"\n" +
"```java\n" +
"@ControllerAdvice\n" +
"public class ArithmeticExceptionHandler {\n" +
"    @ExceptionHandler(ArithmeticException.class)\n" +
"    public void resolve(ArithmeticException e) {\n" +
"        // 异常处理逻辑\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"重新Debug来到 processDispatchResult 方法，进入到 processHandlerException 中：\n" +
"\n" +
"```java\n" +
"    for (HandlerExceptionResolver resolver : this.handlerExceptionResolvers) {\n" +
"        exMv = resolver.resolveException(request, response, handler, ex);\n" +
"        if (exMv != null) {\n" +
"            break;\n" +
"        }\n" +
"    }\n" +
"```\n" +
"\n" +
"这一段还是会获取那两个处理器，但在这里面有了一个新的变化，进到 `HandlerExceptionResolverComposite` 的 `resolveException` 中：\n" +
"\n" +
"##### 5.7.1.2 HandlerExceptionResolverComposite.resolveException\n" +
"\n" +
"```java\n" +
"public ModelAndView resolveException(\n" +
"        HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex) {\n" +
"    if (this.resolvers != null) {\n" +
"        for (HandlerExceptionResolver handlerExceptionResolver : this.resolvers) {\n" +
"            ModelAndView mav = handlerExceptionResolver.resolveException(request, response, handler, ex);\n" +
"            if (mav != null) {\n" +
"                return mav;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    return null;\n" +
"}\n" +
"```\n" +
"\n" +
"它会循环获取一组 `HandlerExceptionResolver` ，通过Debug发现它有3个：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b7642c281cb~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"第一个我们看上去会有一种既熟悉又陌生的感觉：我们在做异常处理的时候用的注解就是 `@ExceptionHandler` ，所以一定会从这个 `ExceptionResolver` 中进去：\n" +
"\n" +
"##### 5.7.1.3 ExceptionHandlerExceptionResolver\n" +
"\n" +
"```java\n" +
"public ModelAndView resolveException(\n" +
"        HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex) {\n" +
"    if (shouldApplyTo(request, handler)) {\n" +
"        prepareResponse(ex, response);\n" +
"        ModelAndView result = doResolveException(request, response, handler, ex);\n" +
"        if (result != null) {\n" +
"            // Print debug message when warn logger is not enabled.\n" +
"            if (logger.isDebugEnabled() && (this.warnLogger == null || !this.warnLogger.isWarnEnabled())) {\n" +
"                logger.debug(\"Resolved [\" + ex + \"]\" + (result.isEmpty() ? \"\" : \" to \" + result));\n" +
"            }\n" +
"            // Explicitly configured warn logger in logException method.\n" +
"            logException(ex, request);\n" +
"        }\n" +
"        return result;\n" +
"    }\n" +
"    else {\n" +
"        return null;\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"又看到了 doXXX方法，直接直接来看 `doResolveException` ：\n" +
"\n" +
"##### 5.7.1.4 doResolveException\n" +
"\n" +
"```java\n" +
"protected final ModelAndView doResolveException(\n" +
"        HttpServletRequest request, HttpServletResponse response, @Nullable Object handler, Exception ex) {\n" +
"    return doResolveHandlerMethodException(request, response, (HandlerMethod) handler, ex);\n" +
"}\n" +
"\n" +
"protected ModelAndView doResolveHandlerMethodException(HttpServletRequest request,\n" +
"        HttpServletResponse response, @Nullable HandlerMethod handlerMethod, Exception exception) {\n" +
"    ServletInvocableHandlerMethod exceptionHandlerMethod = getExceptionHandlerMethod(handlerMethod, exception);\n" +
"    // ......\n" +
"\n" +
"    try {\n" +
"        if (logger.isDebugEnabled()) {\n" +
"            logger.debug(\"Using @ExceptionHandler \" + exceptionHandlerMethod);\n" +
"        }\n" +
"        Throwable cause = exception.getCause();\n" +
"        if (cause != null) {\n" +
"            // Expose cause as provided argument as well\n" +
"            exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, exception, cause, handlerMethod);\n" +
"        }\n" +
"        else {\n" +
"            // Otherwise, just the given exception as-is\n" +
"            exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, exception, handlerMethod);\n" +
"        }\n" +
"    }\n" +
"    // catch and other ......\n" +
"}\n" +
"```\n" +
"\n" +
"不重要的片段已经省略掉了，注意看这个 `doResolveHandlerMethodException` 的设计，是不是有那么一点似曾相识？是不是很像前面5.5.2章节中 `invokeHandlerMethod` 的设计？它先创建 `ServletInvocableHandlerMethod` ，后执行方法，而且执行的方法还都叫 `invokeAndHandle` ，实际Debug进去发现就是跟之前的一致。\n" +
"\n" +
"至此，自定义异常处理器的执行流程完毕。\n" +
"\n" +
"------\n" +
"\n" +
"#### 5.7.2 render：渲染视图\n" +
"\n" +
"回到 `processDispatchResult` 方法的中间部分：\n" +
"\n" +
"```java\n" +
"    if (mv != null && !mv.wasCleared()) {\n" +
"        // 5.7.2 渲染结果视图\n" +
"        render(mv, request, response);\n" +
"        if (errorView) {\n" +
"            WebUtils.clearErrorRequestAttributes(request);\n" +
"        }\n" +
"    }\n" +
"```\n" +
"\n" +
"它要拿到 `ModelAndView` 对象，来实际渲染：\n" +
"\n" +
"```java\n" +
"protected void render(ModelAndView mv, HttpServletRequest request, HttpServletResponse response) throws Exception {\n" +
"    // Determine locale for request and apply it to the response.\n" +
"    // 国际化处理\n" +
"    Locale locale =\n" +
"            (this.localeResolver != null ? this.localeResolver.resolveLocale(request) : request.getLocale());\n" +
"    response.setLocale(locale);\n" +
"\n" +
"    View view;\n" +
"    String viewName = mv.getViewName();\n" +
"    if (viewName != null) {\n" +
"        // We need to resolve the view name.\n" +
"        // 5.7.2.1 解析viewName获取对应View\n" +
"        view = resolveViewName(viewName, mv.getModelInternal(), locale, request);\n" +
"        // 如果没有解析到View，则抛出异常\n" +
"        if (view == null) {\n" +
"            throw new ServletException(\"Could not resolve view with name '\" + mv.getViewName() +\n" +
"                    \"' in servlet with name '\" + getServletName() + \"'\");\n" +
"        }\n" +
"    }\n" +
"    else {\n" +
"        // No need to lookup: the ModelAndView object contains the actual View object.\n" +
"        view = mv.getView();\n" +
"        if (view == null) {\n" +
"            throw new ServletException(\"ModelAndView [\" + mv + \"] neither contains a view name nor a \" +\n" +
"                    \"View object in servlet with name '\" + getServletName() + \"'\");\n" +
"        }\n" +
"    }\n" +
"\n" +
"    // Delegate to the View object for rendering.\n" +
"    if (logger.isTraceEnabled()) {\n" +
"        logger.trace(\"Rendering view [\" + view + \"] \");\n" +
"    }\n" +
"    try {\n" +
"        if (mv.getStatus() != null) {\n" +
"            response.setStatus(mv.getStatus().value());\n" +
"        }\n" +
"        // 5.7.2.3 带入Model的数据来真正渲染视图\n" +
"        view.render(mv.getModelInternal(), request, response);\n" +
"    }\n" +
"    catch (Exception ex) {\n" +
"        if (logger.isDebugEnabled()) {\n" +
"            logger.debug(\"Error rendering view [\" + view + \"]\", ex);\n" +
"        }\n" +
"        throw ex;\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"这部分渲染要先处理国际化，接下来才是借助 `ViewResolver` 来获取视图，之后由视图来组合数据，进行渲染。先来看看 ViewResolver是如何解析出 View 的：\n" +
"\n" +
"##### 5.7.2.1 resolveViewName\n" +
"\n" +
"```java\n" +
"protected View resolveViewName(String viewName, @Nullable Map<String, Object> model,\n" +
"        Locale locale, HttpServletRequest request) throws Exception {\n" +
"    if (this.viewResolvers != null) {\n" +
"        for (ViewResolver viewResolver : this.viewResolvers) {\n" +
"            View view = viewResolver.resolveViewName(viewName, locale);\n" +
"            if (view != null) {\n" +
"                return view;\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    return null;\n" +
"}\n" +
"```\n" +
"\n" +
"通过Debug发现默认有5个 `ViewResolver` ：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b77e3a9df29~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"之前咱介绍过，`ContentNegotiatingViewResolver` 是最高级的 `ViewResolver` ，来看它的 `resolveViewName` 方法：\n" +
"\n" +
"```java\n" +
"public View resolveViewName(String viewName, Locale locale) throws Exception {\n" +
"    RequestAttributes attrs = RequestContextHolder.getRequestAttributes();\n" +
"    Assert.state(attrs instanceof ServletRequestAttributes, \"No current ServletRequestAttributes\");\n" +
"    List<MediaType> requestedMediaTypes = getMediaTypes(((ServletRequestAttributes) attrs).getRequest());\n" +
"    if (requestedMediaTypes != null) {\n" +
"        // 5.7.2.2 搜索所有匹配的View\n" +
"        List<View> candidateViews = getCandidateViews(viewName, locale, requestedMediaTypes);\n" +
"        // 选一个最合适的\n" +
"        View bestView = getBestView(candidateViews, requestedMediaTypes, attrs);\n" +
"        if (bestView != null) {\n" +
"            return bestView;\n" +
"        }\n" +
"    }\n" +
"\n" +
"    // log......\n" +
"}\n" +
"```\n" +
"\n" +
"源码中的思路很简单，它会先从当前所有的 `View` 中找出来所有可以匹配上的 `View` ，之后再从这里面选一个最合适的，返回出去。\n" +
"\n" +
"##### 5.7.2.2 getCandidateViews：搜索所有匹配的View\n" +
"\n" +
"```java\n" +
"private List<View> getCandidateViews(String viewName, Locale locale, List<MediaType> requestedMediaTypes)\n" +
"        throws Exception {\n" +
"\n" +
"    List<View> candidateViews = new ArrayList<>();\n" +
"    if (this.viewResolvers != null) {\n" +
"        Assert.state(this.contentNegotiationManager != null, \"No ContentNegotiationManager set\");\n" +
"        // 借助ViewResolver\n" +
"        for (ViewResolver viewResolver : this.viewResolvers) {\n" +
"            View view = viewResolver.resolveViewName(viewName, locale);\n" +
"            if (view != null) {\n" +
"                candidateViews.add(view);\n" +
"            }\n" +
"            for (MediaType requestedMediaType : requestedMediaTypes) {\n" +
"                List<String> extensions = this.contentNegotiationManager.resolveFileExtensions(requestedMediaType);\n" +
"                for (String extension : extensions) {\n" +
"                    String viewNameWithExtension = viewName + '.' + extension;\n" +
"                    view = viewResolver.resolveViewName(viewNameWithExtension, locale);\n" +
"                    if (view != null) {\n" +
"                        candidateViews.add(view);\n" +
"                    }\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"    if (!CollectionUtils.isEmpty(this.defaultViews)) {\n" +
"        candidateViews.addAll(this.defaultViews);\n" +
"    }\n" +
"    return candidateViews;\n" +
"}\n" +
"```\n" +
"\n" +
"发现它会拿剩余的所有的 `ViewResolver` 去匹配 `View` 对象，之后根据下面的 `MediaType` 过滤来决定是否可以被渲染。\n" +
"\n" +
"这也就解释了前面 `ContentNegotiatingViewResolver` 的功能，它负责分发给真正的 `ViewResolver` 。\n" +
"\n" +
"当最合适的 View 选出来之后，通过Debug发现它确实来自 `ContentNegotiatingViewResolver` ，而且 `View` 的类型是 `ThymeleafView`：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b7a59b6d099~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"##### 5.7.2.3 回到render：view.render\n" +
"\n" +
"```java\n" +
"    try {\n" +
"        if (mv.getStatus() != null) {\n" +
"            response.setStatus(mv.getStatus().value());\n" +
"        }\n" +
"        // 带入Model的数据来真正渲染视图\n" +
"        view.render(mv.getModelInternal(), request, response);\n" +
"    }\n" +
"```\n" +
"\n" +
"找到 `View` 后下面要实际带入 `Model` 的数据来渲染视图了。\n" +
"\n" +
"由于 `ThymeleafView` 中的渲染逻辑很复杂且带有 **Thymeleaf** 的语法，小册不展开解析了，感兴趣的小伙伴可以Debug进去看一眼，感受模板引擎的复杂。\n" +
"\n" +
"### 5.8 applyAfterConcurrentHandlingStarted：回调拦截器\n" +
"\n" +
"```java\n" +
"    finally {\n" +
"        if (asyncManager.isConcurrentHandlingStarted()) {\n" +
"            // Instead of postHandle and afterCompletion\n" +
"            if (mappedHandler != null) {\n" +
"                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);\n" +
"            }\n" +
"        }\n" +
"        else {\n" +
"            // Clean up any resources used by a multipart request.\n" +
"            if (multipartRequestParsed) {\n" +
"                cleanupMultipart(processedRequest);\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"```\n" +
"\n" +
"很明显跟之前一样，它又会回调拦截器：\n" +
"\n" +
"```java\n" +
"void applyAfterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response) {\n" +
"    HandlerInterceptor[] interceptors = getInterceptors();\n" +
"    if (!ObjectUtils.isEmpty(interceptors)) {\n" +
"        for (int i = interceptors.length - 1; i >= 0; i--) {\n" +
"            if (interceptors[i] instanceof AsyncHandlerInterceptor) {\n" +
"                try {\n" +
"                    AsyncHandlerInterceptor asyncInterceptor = (AsyncHandlerInterceptor) interceptors[i];\n" +
"                    asyncInterceptor.afterConcurrentHandlingStarted(request, response, this.handler);\n" +
"                }\n" +
"                catch (Throwable ex) {\n" +
"                    logger.error(\"Interceptor [\" + interceptors[i] + \"] failed in afterConcurrentHandlingStarted\", ex);\n" +
"                }\n" +
"            }\n" +
"        }\n" +
"    }\n" +
"}\n" +
"```\n" +
"\n" +
"不过这一次回调的方法都是 `AsyncHandlerInterceptor` 类型的 `afterConcurrentHandlingStarted` 方法，它用来处理异步请求，感兴趣的小伙伴们可以接触一下这个类型的拦截器。\n" +
"\n" +
"------\n" +
"\n" +
"至此，`doDispatch` 方法执行完毕。\n" +
"\n" +
"## 6. @ResponseBody响应json数据的原理\n" +
"\n" +
"上面是响应视图，在前后端分离的微服务开发时都是用 `@RestController` 或 `@ResponseBody` 来响应json数据而不是视图。这部分对应的原理要追回到5.5.6章节的 `invocableMethod.invokeAndHandle` 方法：\n" +
"\n" +
"```java\n" +
"public void invokeAndHandle(ServletWebRequest webRequest, ModelAndViewContainer mavContainer,\n" +
"        Object... providedArgs) throws Exception {\n" +
"    Object returnValue = invokeForRequest(webRequest, mavContainer, providedArgs);\n" +
"    // ......\n" +
"    try {\n" +
"        // 处理返回值\n" +
"        this.returnValueHandlers.handleReturnValue(\n" +
"                returnValue, getReturnValueType(returnValue), mavContainer, webRequest);\n" +
"    }\n" +
"    // ......\n" +
"}\n" +
"```\n" +
"\n" +
"在处理返回值时，就不再使用 `ViewNameMethodReturnValueHandler` 作为 `ReturnValueHandler` 了，而是使用 `RequestResponseBodyMethodProcessor`：\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/10/23/16df6b7c425f2db1~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"接下来进入它的 `handleReturnValue` 方法：\n" +
"\n" +
"```java\n" +
"public void handleReturnValue(@Nullable Object returnValue, MethodParameter returnType,\n" +
"        ModelAndViewContainer mavContainer, NativeWebRequest webRequest)\n" +
"        throws IOException, HttpMediaTypeNotAcceptableException, HttpMessageNotWritableException {\n" +
"    mavContainer.setRequestHandled(true);\n" +
"    ServletServerHttpRequest inputMessage = createInputMessage(webRequest);\n" +
"    ServletServerHttpResponse outputMessage = createOutputMessage(webRequest);\n" +
"\n" +
"    // Try even with null return value. ResponseBodyAdvice could get involved.\n" +
"    writeWithMessageConverters(returnValue, returnType, inputMessage, outputMessage);\n" +
"}\n" +
"```\n" +
"\n" +
"可以发现最后一句是直接写响应内容了。这个 writeWithMessageConverters 方法很复杂，感兴趣的小伙伴可以跟进去看一下，它最终也是用的 response 的 outputStream 来写入响应内容。\n" +
"\n" +
"## 流程图\n" +
"\n" +
"\n" +
"\n" +
"![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/11/2/16e2a32296c5f67c~tplv-t2oaga2asx-zoom-in-crop-mark:3024:0:0:0.awebp)\n" +
"\n" +
"\n" +
"\n" +
"## 小结\n" +
"\n" +
"1. `DispatcherServlet` 最终继承了 `HttpServlet` ，核心方法是 `doDispatch` 。\n" +
"2. `DispatcherServlet` 的核心流程是先获取 `HandlerMapping` ，后获取 `HandlerAdapter` ，最终执行目标 Controller 的方法，最终返回 View 或响应 json。\n" +
"\n" +
"【至此，`DispatcherServlet` 的核心工作原理解析完毕，下一篇咱来看看它内置的嵌入式Web容器是如何创建的，以及内部如何配置它的】";