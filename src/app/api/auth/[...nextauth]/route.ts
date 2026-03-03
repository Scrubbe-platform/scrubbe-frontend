import * as auth from "../../../../auth"; // Referring to the auth.ts we just created

// const handler = NextAuth({
//   providers: [
//     GithubProvider({
//       clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
//       clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET!,
//     }),
//     GitlabProvider({
//       clientId: process.env.GITLAB_CLIENT_ID!,
//       clientSecret: process.env.GITLAB_CLIENT_SECRET!,
//     }),
//     // Azure AD via generic OAuth
//     {
//       id: "azure-ad",
//       name: "Azure AD",
//       type: "oauth",
//       wellKnown: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`,
//       clientId: process.env.AZURE_AD_CLIENT_ID!,
//       clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
//       authorization: { params: { scope: "openid profile email" } },
//       profile(profile) {
//         return {
//           id: profile.oid,
//           name: profile.name,
//           email: profile.preferred_username,
//         };
//       },
//     } as OAuthConfig<Profile>,
//     // AWS Cognito via generic OAuth
//     {
//       id: "cognito",
//       name: "Cognito",
//       type: "oauth",
//       wellKnown: `${process.env.AWS_COGNITO_ISSUER}/.well-known/openid-configuration`,
//       clientId: process.env.AWS_COGNITO_CLIENT_ID!,
//       clientSecret: process.env.AWS_COGNITO_CLIENT_SECRET!,
//       authorization: { params: { scope: "openid profile email" } },
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//         };
//       },
//     } as OAuthConfig<Profile>,
//   ],
// });

// export { handler as GET, handler as POST };

export const { GET, POST } = auth;
