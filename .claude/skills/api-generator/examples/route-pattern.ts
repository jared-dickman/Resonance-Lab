/**
 * CANONICAL API ROUTE PATTERN
 *
 * Source: app/api/blog-posts/route.ts
 *
 * This is the EXACT pattern ALL generated API routes MUST follow.
 * Zero deviations allowed - this passes all ast-grep rules and security audits.
 */

import {validateQueryParams} from '@/app/utils/api-validation'
import {createValidatedResponse} from '@/app/utils/api-response'
import {authenticateApiRequest, validateCompanyData} from '@/app/utils/api-auth'
import {handleApiError} from '@/app/utils/api-errors'
import {responseSchema} from '@/app/features/{domain}/dto/{domain}-response.schema'
import {create{Domain}Service} from '@/app/features/{domain}/service'
import {to{Domain}Response} from '@/app/features/{domain}/transformers/{domain}.transformer'
import {randomUUID} from 'crypto'
import {NextResponse} from 'next/server'
import {z} from 'zod'

const querySchema = z.object({
  companyId: z.string().optional(),
  // Add other query params as needed
})

export async function GET(request: Request) {
  const requestId = randomUUID() // For tracing/debugging

  try {
    // STEP 1: Validate query params with Zod schema
    const queryValidation = validateQueryParams(request, querySchema)
    if (!queryValidation.success) return queryValidation.response

    // STEP 2: Auth check + company access validation
    // Returns {success: true, userId, companyId} or error response
    const authResult = await authenticateApiRequest(queryValidation.data.companyId)
    if (!authResult.success) return authResult.response

    const {companyId, userId} = authResult

    // STEP 3: Call service layer with BOTH userId AND companyId
    // Service layer does its own validation (defense-in-depth)
    const service = create{Domain}Service()
    const data = await service.list(userId, companyId)

    // STEP 4: PARANOID CHECK - Verify no cross-company data leaks
    // This is REQUIRED for multi-tenant security even if service validates
    const validationError = validateCompanyData(data, companyId, {
      route: 'GET /api/{domain}',
      service: '{domain}',
      requestId,
      userId,
    })
    if (validationError) return validationError

    // STEP 5: Transform entities to API response DTOs
    const response = {
      {domain}: data.map(to{Domain}Response),
    }

    // STEP 6: Validate response schema and return
    // Catches any field mismatches at runtime
    return createValidatedResponse(response, responseSchema)
  } catch (error) {
    // Consistent error handling: logs to errorTracker, returns 500
    return handleApiError(error, {service: '{domain}', requestId})
  }
}

/**
 * POST/PUT/PATCH pattern - use validateRequestBody instead:
 *
 * const bodyValidation = await validateRequestBody(request, bodySchema)
 * if (!bodyValidation.success) return bodyValidation.response
 *
 * const {companyId, userId} = authResult
 * const created = await service.create(userId, companyId, bodyValidation.data)
 */