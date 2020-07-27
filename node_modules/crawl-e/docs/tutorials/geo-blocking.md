# How to work around Geo Blocking 

Based on your location some cinema sites may block access. In such cases you may get [403 Forbidden](https://httpstatuses.com/403) error responses or other error pages. 

To work around these geo blocking filters you need to route the traffic through another country, that is not blocked. This should always be the case for the country the cinema is located in and ofter inlcudes many more. 

There are different options to get the traffic routed that way. <br>
In Google Chrome you may us one of this extensions *or a HTTP Proxy (see below)*: 

- [Touch VPN](https://chrome.google.com/webstore/detail/touch-vpn/bihmplhobchoageeokmgbdihknkjbknd?hl=en)
- [Free Chrome VPN proxy](https://chrome.google.com/webstore/detail/free-chrome-vpn-proxy/domgapgimficjfpblhbihklajoofkijh?hl=en)

They allow you to read and inspect the website as well as make out which country is not blocked. 

Once you know the website actually works from a different country, you need to also configure the Framework to route traffic through that country as well. Therefor you need a HTTP or HTTPS Proxy, which's URI can be configured using the `proxyUri` property. 

## How to find a Proxy

There numerous websites listing free HTTP proxies out there. By [google-ing "free http proxy"](https://www.google.com/search?q=free+http+proxy) for example, you can find https://hidemy.name/en/proxy-list/. 

It list proxy by IP, Port, Country, … and Type. 
Pick and combine type (`http` or `https`) with IP and Port in the format of `$type://$ip:$port`, which build the `proxyUri`. 

