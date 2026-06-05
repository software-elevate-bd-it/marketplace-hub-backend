{
  "name": "Authentication",
  "description": "Login, registration, OTP, social and session management.",
  "endpoints": [
    {
      "method": "POST",
      "path": "/auth/register",
      "summary": "Register a new user with email + password.",
      "request": { "email": "string", "password": "string", "name": "string", "country": "string (ISO2)" },
      "response": {
        "body": { "id": "u_123", "email": "jane@doe.com", "name": "Jane", "token": "jwt..." },
        "status": true,
        "message": "Account created",
        "responsecode": 201,
        "extraData": { "verificationRequired": true }
      }
    },
    {
      "method": "POST",
      "path": "/auth/login",
      "summary": "Email + password login.",
      "request": { "email": "string", "password": "string" },
      "response": {
        "body": { "token": "jwt...", "user": { "id": "u_123", "name": "Jane" } },
        "status": true,
        "message": "Logged in",
        "responsecode": 200,
        "extraData": { "expiresIn": 86400 }
      }
    },
    {
      "method": "POST",
      "path": "/auth/otp/request",
      "summary": "Send OTP to phone/email.",
      "request": { "channel": "phone | email", "destination": "string" },
      "response": { "body": true, "status": true, "message": "OTP sent", "responsecode": 200, "extraData": { "ttl": 300 } }
    },
    {
      "method": "POST",
      "path": "/auth/otp/verify",
      "summary": "Verify a one-time code.",
      "request": { "destination": "string", "code": "string" },
      "response": { "body": { "token": "jwt..." }, "status": true, "message": "Verified", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "POST",
      "path": "/auth/social",
      "summary": "Sign in with Google / Apple / Facebook.",
      "request": { "provider": "google | apple | facebook", "idToken": "string" },
      "response": { "body": { "token": "jwt...", "user": {} }, "status": true, "message": "Logged in", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "POST",
      "path": "/auth/logout",
      "summary": "Invalidate session.",
      "request": {},
      "response": { "body": true, "status": true, "message": "Logged out", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "POST",
      "path": "/auth/password/forgot",
      "summary": "Request password reset link.",
      "request": { "email": "string" },
      "response": { "body": true, "status": true, "message": "Reset email sent", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "POST",
      "path": "/auth/password/reset",
      "summary": "Reset password using token.",
      "request": { "token": "string", "password": "string" },
      "response": { "body": true, "status": true, "message": "Password updated", "responsecode": 200, "extraData": {} }
    }
  ]
}



{
  "name": "Users & Profile",
  "endpoints": [
    {
      "method": "GET",
      "path": "/users/me",
      "summary": "Current authenticated user.",
      "request": {},
      "response": {
        "body": { "id": "u_123", "name": "Jane", "email": "jane@doe.com", "avatar": "url", "country": "US", "language": "en" },
        "status": true, "message": "OK", "responsecode": 200, "extraData": {}
      }
    },
    {
      "method": "PATCH",
      "path": "/users/me",
      "summary": "Update profile fields.",
      "request": { "name": "string?", "avatar": "string?", "country": "string?", "language": "string?" },
      "response": { "body": { "id": "u_123" }, "status": true, "message": "Profile updated", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "DELETE",
      "path": "/users/me",
      "summary": "Delete account.",
      "request": {},
      "response": { "body": true, "status": true, "message": "Account deleted", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "GET",
      "path": "/users/:id",
      "summary": "Public user/seller profile.",
      "request": {},
      "response": { "body": { "id": "u_123", "name": "Jane", "rating": 4.9, "listingsCount": 12 }, "status": true, "message": "OK", "responsecode": 200, "extraData": {} }
    }
  ]
}


{
  "name": "Listings",
  "endpoints": [
    {
      "method": "GET",
      "path": "/listings",
      "summary": "Search & filter listings.",
      "query": { "q": "string?", "category": "string?", "country": "string?", "minPrice": "number?", "maxPrice": "number?", "sort": "newest | price_asc | price_desc | popular", "page": "number?", "limit": "number?" },
      "response": {
        "body": [
          { "id": "1", "title": "Hand-thrown stoneware bowl", "price": 64, "currency": "USD", "category": "Ceramics", "location": "Brooklyn, NY", "country": "US", "image": "https://...", "condition": "New", "createdAt": "2025-04-12" }
        ],
        "status": true, "message": "OK", "responsecode": 200,
        "extraData": { "page": 1, "limit": 20, "total": 142, "hasMore": true }
      }
    },
    {
      "method": "GET",
      "path": "/listings/:id",
      "summary": "Single listing detail.",
      "response": {
        "body": { "id": "1", "title": "Hand-thrown stoneware bowl", "price": 64, "currency": "USD", "description": "...", "seller": { "id": "u_1", "name": "Mira Studio", "rating": 4.9 }, "attributes": { "material": "stoneware" }, "images": ["..."] },
        "status": true, "message": "OK", "responsecode": 200, "extraData": { "viewCount": 213 }
      }
    },
    {
      "method": "POST",
      "path": "/listings",
      "summary": "Create a new listing.",
      "request": { "title": "string", "price": "number", "currency": "string", "category": "string", "country": "string", "location": "string", "description": "string", "condition": "string", "images": "string[]", "attributes": "object?" },
      "response": { "body": { "id": "42" }, "status": true, "message": "Listing created", "responsecode": 201, "extraData": {} }
    },
    {
      "method": "PATCH",
      "path": "/listings/:id",
      "summary": "Update own listing.",
      "request": { "title": "string?", "price": "number?", "description": "string?", "images": "string[]?" },
      "response": { "body": { "id": "42" }, "status": true, "message": "Updated", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "DELETE",
      "path": "/listings/:id",
      "summary": "Delete own listing.",
      "response": { "body": true, "status": true, "message": "Deleted", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "GET",
      "path": "/listings/top-picks",
      "summary": "Personalized top picks.",
      "response": { "body": [{ "id": "1", "title": "...", "price": 64 }], "status": true, "message": "OK", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "GET",
      "path": "/listings/recent",
      "summary": "Most recent listings.",
      "response": { "body": [], "status": true, "message": "OK", "responsecode": 200, "extraData": {} }
    },
    {
      "method": "POST",
      "path": "/listings/:id/report",
      "summary": "Report a listing.",
      "request": { "reason": "string", "details": "string?" },
      "response": { "body": true, "status": true, "message": "Reported", "responsecode": 200, "extraData": {} }
    }
  ]
}
{
  "name": "Categories",
  "endpoints": [
    {
      "method": "GET",
      "path": "/categories",
      "summary": "All categories with industry grouping.",
      "response": {
        "body": [
          { "id": "vehicles", "name": "Vehicles", "icon": "car", "industry": "automotive", "children": [{ "id": "cars", "name": "Cars" }] }
        ],
        "status": true, "message": "OK", "responsecode": 200, "extraData": { "industries": ["automotive", "property", "electronics"] }
      }
    },
    {
      "method": "GET",
      "path": "/categories/:id/schema",
      "summary": "Dynamic filter schema for a category (attributes, ranges).",
      "response": {
        "body": { "fields": [{ "key": "brand", "label": "Brand", "type": "select", "options": ["Toyota", "Honda"] }, { "key": "mileage_km", "label": "Mileage (km)", "type": "range", "min": 0, "max": 300000 }] },
        "status": true, "message": "OK", "responsecode": 200, "extraData": {}
      }
    }
  ]
}



{
    "name": "Favorites",
    "endpoints": [
        {
            "method": "GET",
            "path": "/favorites",
            "summary": "List favorites of current user.",
            "response": {
                "body": [
                    {
                        "id": "1",
                        "title": "..."
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/favorites/:listingId",
            "summary": "Add to favorites.",
            "response": {
                "body": true,
                "status": true,
                "message": "Added",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "DELETE",
            "path": "/favorites/:listingId",
            "summary": "Remove favorite.",
            "response": {
                "body": true,
                "status": true,
                "message": "Removed",
                "responsecode": 200,
                "extraData": {}
            }
        }
    ]
}


{
    "name": "Cart",
    "endpoints": [
        {
            "method": "GET",
            "path": "/cart",
            "summary": "Get current cart.",
            "response": {
                "body": {
                    "items": [
                        {
                            "listingId": "1",
                            "qty": 1,
                            "price": 64
                        }
                    ],
                    "subtotal": 64,
                    "currency": "USD"
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/cart/items",
            "summary": "Add item to cart.",
            "request": {
                "listingId": "string",
                "qty": "number"
            },
            "response": {
                "body": true,
                "status": true,
                "message": "Added",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "PATCH",
            "path": "/cart/items/:listingId",
            "summary": "Update quantity.",
            "request": {
                "qty": "number"
            },
            "response": {
                "body": true,
                "status": true,
                "message": "Updated",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "DELETE",
            "path": "/cart/items/:listingId",
            "summary": "Remove item.",
            "response": {
                "body": true,
                "status": true,
                "message": "Removed",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "DELETE",
            "path": "/cart",
            "summary": "Clear cart.",
            "response": {
                "body": true,
                "status": true,
                "message": "Cleared",
                "responsecode": 200,
                "extraData": {}
            }
        }
    ]
}

{
    "name": "Orders & Escrow",
    "endpoints": [
        {
            "method": "GET",
            "path": "/orders",
            "summary": "List user orders.",
            "response": {
                "body": [
                    {
                        "id": "o_1",
                        "status": "in_escrow",
                        "total": 64,
                        "currency": "USD",
                        "createdAt": "2025-05-01"
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "page": 1,
                    "total": 4
                }
            }
        },
        {
            "method": "GET",
            "path": "/orders/:id",
            "summary": "Order detail with escrow timeline.",
            "response": {
                "body": {
                    "id": "o_1",
                    "items": [],
                    "escrow": {
                        "stage": "funds_held",
                        "history": [
                            {
                                "stage": "created",
                                "at": "..."
                            }
                        ]
                    }
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/orders/checkout",
            "summary": "Create order from cart (escrow).",
            "request": {
                "shippingAddress": "object",
                "paymentMethod": "string"
            },
            "response": {
                "body": {
                    "orderId": "o_1",
                    "paymentUrl": "https://..."
                },
                "status": true,
                "message": "Order created",
                "responsecode": 201,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/orders/:id/release",
            "summary": "Buyer releases escrow funds.",
            "response": {
                "body": true,
                "status": true,
                "message": "Released",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/orders/:id/dispute",
            "summary": "Open a dispute.",
            "request": {
                "reason": "string",
                "evidence": "string[]?"
            },
            "response": {
                "body": {
                    "disputeId": "d_1"
                },
                "status": true,
                "message": "Dispute opened",
                "responsecode": 201,
                "extraData": {}
            }
        }
    ]
}

{
    "name": "Chat & Messaging",
    "endpoints": [
        {
            "method": "GET",
            "path": "/chat/threads",
            "summary": "List chat threads.",
            "response": {
                "body": [
                    {
                        "id": "t_1",
                        "participant": {
                            "id": "u_2",
                            "name": "Mira"
                        },
                        "lastMessage": "Hi",
                        "unread": 2
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "GET",
            "path": "/chat/threads/:id/messages",
            "summary": "Messages in a thread.",
            "query": {
                "before": "iso-date?",
                "limit": "number?"
            },
            "response": {
                "body": [
                    {
                        "id": "m_1",
                        "from": "u_2",
                        "text": "Hi",
                        "at": "..."
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "hasMore": false
                }
            }
        },
        {
            "method": "POST",
            "path": "/chat/threads/:id/messages",
            "summary": "Send a message.",
            "request": {
                "text": "string",
                "attachments": "string[]?"
            },
            "response": {
                "body": {
                    "id": "m_2"
                },
                "status": true,
                "message": "Sent",
                "responsecode": 201,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/chat/threads",
            "summary": "Start a thread with a seller about a listing.",
            "request": {
                "sellerId": "string",
                "listingId": "string",
                "text": "string"
            },
            "response": {
                "body": {
                    "threadId": "t_3"
                },
                "status": true,
                "message": "Thread created",
                "responsecode": 201,
                "extraData": {}
            }
        }
    ]
}

{
    "name": "Sellers",
    "endpoints": [
        {
            "method": "GET",
            "path": "/sellers/:slug",
            "summary": "Public seller profile.",
            "response": {
                "body": {
                    "id": "u_1",
                    "slug": "mira-studio",
                    "name": "Mira Studio",
                    "rating": 4.9,
                    "bio": "...",
                    "trustBadges": [
                        "verified",
                        "fast_shipper"
                    ]
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "GET",
            "path": "/sellers/:slug/listings",
            "summary": "Listings by seller.",
            "response": {
                "body": [],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "total": 12
                }
            }
        },
        {
            "method": "POST",
            "path": "/sellers/:id/follow",
            "summary": "Follow a seller.",
            "response": {
                "body": true,
                "status": true,
                "message": "Following",
                "responsecode": 200,
                "extraData": {}
            }
        }
    ]
}
{
    "name": "Analytics",
    "endpoints": [
        {
            "method": "GET",
            "path": "/analytics/overview",
            "summary": "Seller dashboard overview.",
            "query": {
                "range": "7d | 30d | 90d"
            },
            "response": {
                "body": {
                    "views": 1240,
                    "messages": 31,
                    "sales": 4,
                    "revenue": 320
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "range": "30d"
                }
            }
        },
        {
            "method": "GET",
            "path": "/analytics/listings/:id",
            "summary": "Per-listing analytics.",
            "response": {
                "body": {
                    "views": 213,
                    "favorites": 12,
                    "messages": 5,
                    "conversionRate": 0.018
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/analytics/track",
            "summary": "Track a client event.",
            "request": {
                "event": "string",
                "props": "object?"
            },
            "response": {
                "body": true,
                "status": true,
                "message": "Tracked",
                "responsecode": 200,
                "extraData": {}
            }
        }
    ]
}
{
    "name": "Pricing & Monetization",
    "endpoints": [
        {
            "method": "GET",
            "path": "/pricing/plans",
            "summary": "List subscription plans.",
            "response": {
                "body": [
                    {
                        "id": "pro",
                        "name": "Pro",
                        "price": 9.99,
                        "currency": "USD",
                        "features": [
                            "Boosted listings",
                            "Analytics"
                        ]
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/pricing/subscribe",
            "summary": "Subscribe to a plan.",
            "request": {
                "planId": "string",
                "paymentMethod": "string"
            },
            "response": {
                "body": {
                    "subscriptionId": "s_1",
                    "activeUntil": "..."
                },
                "status": true,
                "message": "Subscribed",
                "responsecode": 201,
                "extraData": {}
            }
        },
        {
            "method": "POST",
            "path": "/listings/:id/boost",
            "summary": "Boost / feature a listing.",
            "request": {
                "days": "number"
            },
            "response": {
                "body": {
                    "boostedUntil": "..."
                },
                "status": true,
                "message": "Boosted",
                "responsecode": 200,
                "extraData": {
                    "cost": 4.99
                }
            }
        },
        {
            "method": "GET",
            "path": "/referral/code",
            "summary": "Get my referral code.",
            "response": {
                "body": {
                    "code": "JANE10",
                    "url": "https://..."
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "earned": 12.5
                }
            }
        }
    ]
}

{
    "name": "System Settings",
    "endpoints": [
        {
            "method": "GET",
            "path": "/system/settings",
            "summary": "Public site settings.",
            "response": {
                "body": {
                    "appName": "Bechoo",
                    "supportedCountries": [
                        "US",
                        "GB",
                        "IN"
                    ],
                    "supportedLanguages": [
                        "en",
                        "ar",
                        "hi"
                    ],
                    "currencies": [
                        "USD",
                        "EUR",
                        "INR"
                    ],
                    "features": {
                        "escrow": true,
                        "sellForMe": true
                    }
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        },
        {
            "method": "GET",
            "path": "/system/geo",
            "summary": "Detect visitor country/currency.",
            "response": {
                "body": {
                    "country": "US",
                    "currency": "USD",
                    "language": "en"
                },
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {
                    "source": "ip"
                }
            }
        },
        {
            "method": "GET",
            "path": "/system/trust-badges",
            "summary": "Available trust badges and rules.",
            "response": {
                "body": [
                    {
                        "id": "verified",
                        "label": "Verified",
                        "rule": "Phone + ID verified"
                    }
                ],
                "status": true,
                "message": "OK",
                "responsecode": 200,
                "extraData": {}
            }
        }
    ]
}




