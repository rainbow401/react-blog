import React from "react";

import ReactMarkdown from "react-markdown";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import styles from "./content.module.scss";
import { CodeComponent } from "react-markdown/lib/ast-to-react";
import { CodeProps } from "react-markdown/lib/ast-to-react";

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<any> = ({ ...props }) => {
  console.log(props);
  if (props.className) {
    props.className = props.className.replace("language-", "");
    return (
      <SyntaxHighlighter language={props.className} style={dracula}>
        {props.children[0]}
      </SyntaxHighlighter>
    );
  } else {
    return <strong style={{ fontWeight: "bold" }}> {props.children[0]}</strong>;
  }
};

function Content() {
  const md: string =
    "# Hello\n" +
    "\n" +
    "Lorem ipsum dolor sit amet.\n" +
    "\n" +
    "```python hello.py mark=1[22:30]\n" +
    'print("Rendered with Code Hike")\n' +
    "```";

  const data =
    "# 12. IOC：刷新容器-BeanFactory的后处理和组件扫描\n" +
    "\n" +
    "【接前章】\n" +
    "\n" +
    "本篇解析4、5步骤：\n" +
    "\n" +
    "```java\n" +
    "        try {\n" +
    "            // Allows post-processing of the bean factory in context subclasses.\n" +
    "            // 4. BeanFactory的后置处理\n" +
    "            postProcessBeanFactory(beanFactory);\n" +
    "\n" +
    "            // Invoke factory processors registered as beans in the context.\n" +
    "            // 5. 执行BeanFactory创建后的后置处理器\n" +
    "            invokeBeanFactoryPostProcessors(beanFactory);\n" +
    "```\n" +
    "\n" +
    "## 4. postProcessBeanFactory：BeanFactory的后置处理\n" +
    "\n" +
    "在 `AbstractApplicationContext` 中，这个方法又被设置成模板方法了：\n" +
    "\n" +
    "```java\n" +
    "protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "借助IDEA，发现 `AnnotationConfigServletWebServerApplicationContext` 重写了这个方法。\n" +
    "\n" +
    "```java\n" +
    "// AnnotationConfigServletWebServerApplicationContext\n" +
    "protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {\n" +
    "    super.postProcessBeanFactory(beanFactory);\n" +
    "    // 包扫描\n" +
    "    if (this.basePackages != null && this.basePackages.length > 0) {\n" +
    "        this.scanner.scan(this.basePackages);\n" +
    "    }\n" +
    "    if (!this.annotatedClasses.isEmpty()) {\n" +
    "        this.reader.register(ClassUtils.toClassArray(this.annotatedClasses));\n" +
    "    }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "它首先调了父类 `ServletWebServerApplicationContext` 的 `postProcessBeanFactory` 方法。\n" +
    "\n" +
    "### 4.1 ServletWebServerApplicationContext.postProcessBeanFactory\n" +
    "\n" +
    "```java\n" +
    "// ServletWebServerApplicationContext\n" +
    "protected void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {\n" +
    "    // 注册ServletContext注入器\n" +
    "    beanFactory.addBeanPostProcessor(new WebApplicationContextServletContextAwareProcessor(this));\n" +
    "    beanFactory.ignoreDependencyInterface(ServletContextAware.class);\n" +
    "    registerWebApplicationScopes();\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "#### 4.1.1 注册WebApplicationContextServletContextAwareProcessor\n" +
    "\n" +
    "它的文档注释原文翻译：\n" +
    "\n" +
    "> Variant of ServletContextAwareProcessor for use with a ConfigurableWebApplicationContext. Can be used when registering the processor can occur before the ServletContext or ServletConfig have been initialized.\n" +
    ">\n" +
    "> `ServletContextAwareProcessor` 的扩展，用于 `ConfigurableWebApplicationContext` 。可以在初始化 ServletContext 或 ServletConfig 之前进行处理器注册时使用。\n" +
    "\n" +
    "似乎看不出什么很明显的思路，但它说是 `ServletContextAwareProcessor` 的扩展，那追到 `ServletContextAwareProcessor` 的文档注释：\n" +
    "\n" +
    "> BeanPostProcessor implementation that passes the ServletContext to beans that implement the ServletContextAware interface. Web application contexts will automatically register this with their underlying bean factory. Applications do not use this directly.\n" +
    ">\n" +
    "> 将 `ServletContext` 传递给实现 `ServletContextAware` 接口的Bean的 `BeanPostProcessor` 实现。\n" +
    ">\n" +
    "> Web应用程序上下文将自动将其注册到其底层bean工厂，应用程序不直接使用它。\n" +
    "\n" +
    "发现很明白，它是把 `ServletContext`、`ServletConfig` 注入到组件中。它的核心源码：\n" +
    "\n" +
    "```java\n" +
    "public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {\n" +
    "    if (getServletContext() != null && bean instanceof ServletContextAware) {\n" +
    "        ((ServletContextAware) bean).setServletContext(getServletContext());\n" +
    "    }\n" +
    "    if (getServletConfig() != null && bean instanceof ServletConfigAware) {\n" +
    "        ((ServletConfigAware) bean).setServletConfig(getServletConfig());\n" +
    "    }\n" +
    "    return bean;\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "跟上一篇中的注册几乎是一个套路，不再赘述。\n" +
    "\n" +
    "#### 4.1.2 registerWebApplicationScopes\n" +
    "\n" +
    "```java\n" +
    "private void registerWebApplicationScopes() {\n" +
    "    ExistingWebApplicationScopes existingScopes = new ExistingWebApplicationScopes(getBeanFactory());\n" +
    "    WebApplicationContextUtils.registerWebApplicationScopes(getBeanFactory());\n" +
    "    existingScopes.restore();\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "这个方法没有任何注释，只能靠里面的源码来试着推测。\n" +
    "\n" +
    "##### 4.1.2.1 ExistingWebApplicationScopes\n" +
    "\n" +
    "从字面意思上看，它是表示在Web应用上已经存在的作用域。它的部分源码：\n" +
    "\n" +
    "```java\n" +
    "public static class ExistingWebApplicationScopes {\n" +
    "\n" +
    "    private static final Set<String> SCOPES;\n" +
    "\n" +
    "    static {\n" +
    "        Set<String> scopes = new LinkedHashSet<>();\n" +
    "        scopes.add(WebApplicationContext.SCOPE_REQUEST);\n" +
    "        scopes.add(WebApplicationContext.SCOPE_SESSION);\n" +
    "        SCOPES = Collections.unmodifiableSet(scopes);\n" +
    "    }\n" +
    "  \n" +
    "    public void restore() {\n" +
    "        this.scopes.forEach((key, value) -> {\n" +
    "            if (logger.isInfoEnabled()) {\n" +
    '                logger.info("Restoring user defined scope " + key);\n' +
    "            }\n" +
    "            this.beanFactory.registerScope(key, value);\n" +
    "        });\n" +
    "    }\n" +
    "```\n" +
    "\n" +
    "发现它确实是缓存了两种scope，分别是 request 域和 session 域。\n" +
    "\n" +
    "下面的 `restore` 方法，是把现在缓存的所有作用域，注册到 BeanFactory 中。\n" +
    "\n" +
    "大概猜测这是**将Web的request域和session域注册到IOC容器，让IOC容器知道这两种作用域**（学过 SpringFramework 都知道Bean的作用域有request 和 session）。\n" +
    "\n" +
    "##### 4.1.2.2 WebApplicationContextUtils.registerWebApplicationScopes\n" +
    "\n" +
    "```java\n" +
    "public static void registerWebApplicationScopes(ConfigurableListableBeanFactory beanFactory) {\n" +
    "    registerWebApplicationScopes(beanFactory, null);\n" +
    "}\n" +
    "\n" +
    "public static void registerWebApplicationScopes(ConfigurableListableBeanFactory beanFactory,\n" +
    "        @Nullable ServletContext sc) {\n" +
    "\n" +
    "    // 注册作用域类型\n" +
    "    beanFactory.registerScope(WebApplicationContext.SCOPE_REQUEST, new RequestScope());\n" +
    "    beanFactory.registerScope(WebApplicationContext.SCOPE_SESSION, new SessionScope());\n" +
    "    if (sc != null) {\n" +
    "        ServletContextScope appScope = new ServletContextScope(sc);\n" +
    "        beanFactory.registerScope(WebApplicationContext.SCOPE_APPLICATION, appScope);\n" +
    "        // Register as ServletContext attribute, for ContextCleanupListener to detect it.\n" +
    "        sc.setAttribute(ServletContextScope.class.getName(), appScope);\n" +
    "    }\n" +
    "\n" +
    "    // 自动注入的支持\n" +
    "    beanFactory.registerResolvableDependency(ServletRequest.class, new RequestObjectFactory());\n" +
    "    beanFactory.registerResolvableDependency(ServletResponse.class, new ResponseObjectFactory());\n" +
    "    beanFactory.registerResolvableDependency(HttpSession.class, new SessionObjectFactory());\n" +
    "    beanFactory.registerResolvableDependency(WebRequest.class, new WebRequestObjectFactory());\n" +
    "    if (jsfPresent) {\n" +
    "        FacesDependencyRegistrar.registerFacesDependencies(beanFactory);\n" +
    "    }\n" +
    "}\n" +
    "```\n" +
    "\n";
  return (
    <div className={styles.main}>
      <ReactMarkdown components={{ code: CodeBlock }}>{data}</ReactMarkdown>
    </div>
  );
}

export default Content;
