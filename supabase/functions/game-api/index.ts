import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type TeamSummary = {
  id: string;
  name: string;
  completed_lines?: number;
  second_line_completed_at?: string | null;
};

const sortTeamsByNumber = <T extends { name: string }>(teams: T[] | null | undefined): T[] => {
  return [...(teams || [])].sort((a, b) => {
    const numA = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
    return numA - numB;
  });
};

const shuffleArray = <T>(arr: T[]): T[] => {
  const copied = [...arr];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data } = await req.json()

    if (action === 'get_teams') {
      // 팀 목록 조회 (숫자 순서로 정렬)
      const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name, completed_lines, second_line_completed_at')
        .order('created_at')

      if (error) throw error
      const sortedTeams = sortTeamsByNumber<TeamSummary>(teams as TeamSummary[])

      return new Response(
        JSON.stringify({ success: true, teams: sortedTeams }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_missions') {
      // 미션 목록 조회
      const { data: missions, error } = await supabase
        .from('missions')
        .select('id, title, description, is_free_cell, display_order')
        .order('display_order')

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, missions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'join_team') {
      // 팀 참가 (워크숍 간소화 로그인)
      const { teamId, name, school, major, cohort, userId } = data

      if (!userId) {
        throw new Error('userId is required')
      }

      // 팀원 추가/갱신 (같은 계정은 1개 멤버 레코드 유지)
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .upsert({
          team_id: teamId,
          name,
          school,
          major,
          cohort,
          user_id: userId
        }, { onConflict: 'user_id' })
        .select()
        .single()

      if (memberError) throw memberError

      // 팀의 빙고 보드 확인/생성
      let { data: board } = await supabase
        .from('bingo_boards')
        .select('id')
        .eq('team_id', teamId)
        .maybeSingle()

      if (!board) {
        // 빙고 보드 생성
        const { data: newBoard, error: createBoardError } = await supabase
          .from('bingo_boards')
          .insert({ team_id: teamId })
          .select()
          .single()

        if (createBoardError) throw createBoardError
        board = newBoard

        // 보드 셀 생성 (25개)
        const { data: missions, error: missionsError } = await supabase
          .from('missions')
          .select('id, display_order')
          .order('display_order')
        if (missionsError) throw missionsError

        if (missions && board) {
          // 팀당 최초 1회: 25칸 완전 랜덤 배치
          const shuffled = shuffleArray(missions as Array<{ id: number; display_order: number }>)
          const cells = shuffled.map((mission, index) => ({
            board_id: board!.id,
            mission_id: mission.id,
            position: index + 1,
            is_completed: false
          }))

          await supabase.from('board_cells').insert(cells)
        }
      }

      if (!board) {
        throw new Error('Failed to create or find board')
      }

      // 팀 정보와 빙고 보드 조회
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name, completed_lines')
        .eq('id', teamId)
        .single()

      const { data: boardCells } = await supabase
        .from('board_cells')
        .select(`
          id,
          position,
          is_completed,
          mission_id,
          missions (id, title, description, is_free_cell)
        `)
        .eq('board_id', board.id)
        .order('position')

      const { data: photos } = await supabase
        .from('photos')
        .select('id, cell_id, public_url')

      return new Response(
        JSON.stringify({ 
          success: true, 
          member,
          team: teamData,
          boardId: board.id,
          cells: boardCells,
          photos
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_board') {
      // 빙고 보드 조회
      const { teamId } = data

      const { data: board } = await supabase
        .from('bingo_boards')
        .select('id')
        .eq('team_id', teamId)
        .maybeSingle()

      if (!board) {
        return new Response(
          JSON.stringify({ success: false, error: 'Board not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      const { data: cells } = await supabase
        .from('board_cells')
        .select(`
          id,
          position,
          is_completed,
          mission_id,
          missions (id, title, description, is_free_cell)
        `)
        .eq('board_id', board.id)
        .order('position')

      const { data: photos } = await supabase
        .from('photos')
        .select('id, cell_id, public_url')

      return new Response(
        JSON.stringify({ success: true, boardId: board.id, cells, photos }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'complete_cell') {
      // 셀 완료 처리
      const { cellId, photoUrls, memberId } = data

      // 셀 완료 표시
      const { error: cellError } = await supabase
        .from('board_cells')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', cellId)

      if (cellError) throw cellError

      // 사진 저장
      if (photoUrls && photoUrls.length > 0) {
        const photoRecords = photoUrls.map((url: string) => ({
          cell_id: cellId,
          storage_path: url,
          public_url: url,
          uploaded_by: memberId
        }))

        await supabase.from('photos').insert(photoRecords)
      }

      // 보너스 칸 완료 시 랜덤 미완료 칸 1개 추가 완료 처리
      const { data: currentCell } = await supabase
        .from('board_cells')
        .select('board_id, mission_id, missions (is_free_cell)')
        .eq('id', cellId)
        .single()

      let bonusAwardedCellId: string | null = null
      if (currentCell?.missions?.is_free_cell) {
        const { data: randomCandidates } = await supabase
          .from('board_cells')
          .select('id')
          .eq('board_id', currentCell.board_id)
          .eq('is_completed', false)
          .neq('id', cellId)

        if (randomCandidates && randomCandidates.length > 0) {
          const randomCell = randomCandidates[Math.floor(Math.random() * randomCandidates.length)]
          bonusAwardedCellId = randomCell.id
          await supabase
            .from('board_cells')
            .update({ is_completed: true, completed_at: new Date().toISOString() })
            .eq('id', randomCell.id)
        }
      }

      return new Response(
        JSON.stringify({ success: true, bonusAwardedCellId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_team_members') {
      // 팀원 목록 조회
      const { teamId } = data

      const { data: members, error } = await supabase
        .from('team_members')
        .select('id, name, school, major, cohort, joined_at')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, members }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update_team_lines') {
      // 팀 완성 라인 수 업데이트
      const { teamId, completedLines } = data

      const updatePayload: Record<string, unknown> = { completed_lines: completedLines }
      let secondLineCompletedAt: string | null = null

      if (completedLines >= 2) {
        const { data: teamBefore } = await supabase
          .from('teams')
          .select('second_line_completed_at')
          .eq('id', teamId)
          .single()
        if (!teamBefore?.second_line_completed_at) {
          secondLineCompletedAt = new Date().toISOString()
          updatePayload.second_line_completed_at = secondLineCompletedAt
        } else {
          secondLineCompletedAt = teamBefore.second_line_completed_at
        }
      }

      const { error } = await supabase
        .from('teams')
        .update(updatePayload)
        .eq('id', teamId)

      if (error) throw error

      let rank: number | null = null
      if (completedLines >= 2) {
        const { data: rankedTeams } = await supabase
          .from('teams')
          .select('id, second_line_completed_at')
          .not('second_line_completed_at', 'is', null)
          .order('second_line_completed_at', { ascending: true })

        rank = (rankedTeams || []).findIndex((t) => t.id === teamId) + 1
        if (rank === 0) rank = null
      }

      return new Response(
        JSON.stringify({ success: true, rank, secondLineCompletedAt }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_team_snapshot') {
      const { data: teams, error: teamError } = await supabase
        .from('teams')
        .select('id, name, completed_lines, second_line_completed_at')
        .order('created_at')
      if (teamError) throw teamError

      const { data: boards, error: boardsError } = await supabase
        .from('bingo_boards')
        .select('id, team_id')
      if (boardsError) throw boardsError

      const boardIds = (boards || []).map((b) => b.id)
      let cells: Array<{ board_id: string; is_completed: boolean }> = []
      if (boardIds.length > 0) {
        const { data: cellRows, error: cellsError } = await supabase
          .from('board_cells')
          .select('board_id, is_completed')
          .in('board_id', boardIds)
        if (cellsError) throw cellsError
        cells = cellRows || []
      }

      const boardToTeam = new Map<string, string>()
      for (const b of boards || []) boardToTeam.set(b.id, b.team_id)

      const completedMap = new Map<string, number>()
      const totalMap = new Map<string, number>()
      for (const cell of cells) {
        const teamId = boardToTeam.get(cell.board_id)
        if (!teamId) continue
        totalMap.set(teamId, (totalMap.get(teamId) || 0) + 1)
        if (cell.is_completed) completedMap.set(teamId, (completedMap.get(teamId) || 0) + 1)
      }

      const rankingOrdered = [...(teams || [])]
        .filter((t) => !!t.second_line_completed_at)
        .sort((a, b) =>
          new Date(a.second_line_completed_at as string).getTime() -
          new Date(b.second_line_completed_at as string).getTime()
        )
      const rankMap = new Map<string, number>()
      rankingOrdered.forEach((team, idx) => rankMap.set(team.id, idx + 1))

      const snapshot = sortTeamsByNumber(teams as TeamSummary[]).map((team) => ({
        id: team.id,
        name: team.name,
        completedLines: team.completed_lines || 0,
        completedMissions: completedMap.get(team.id) || 0,
        totalMissions: totalMap.get(team.id) || 0,
        isSuccess: (team.completed_lines || 0) >= 2,
        secondLineCompletedAt: team.second_line_completed_at || null,
        rank: rankMap.get(team.id) || null
      }))

      return new Response(
        JSON.stringify({ success: true, teams: snapshot }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_team_gallery') {
      const { teamId } = data || {}

      let boardsQuery = supabase
        .from('bingo_boards')
        .select('id, team_id, teams (id, name)')

      if (teamId) boardsQuery = boardsQuery.eq('team_id', teamId)
      const { data: boards, error: boardsError } = await boardsQuery
      if (boardsError) throw boardsError

      if (!boards || boards.length === 0) {
        return new Response(
          JSON.stringify({ success: true, photos: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const boardMap = new Map<string, { teamId: string; teamName: string }>()
      for (const board of boards) {
        boardMap.set(board.id, {
          teamId: board.team_id,
          teamName: board.teams?.name || '알 수 없는 조'
        })
      }

      const boardIds = boards.map((b) => b.id)
      const { data: cells, error: cellsError } = await supabase
        .from('board_cells')
        .select('id, board_id, position, mission_id, missions (id, title)')
        .in('board_id', boardIds)
      if (cellsError) throw cellsError

      const cellIds = (cells || []).map((c) => c.id)
      if (cellIds.length === 0) {
        return new Response(
          JSON.stringify({ success: true, photos: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const cellMap = new Map<string, {
        boardId: string;
        position: number;
        missionTitle: string;
      }>()
      for (const c of cells || []) {
        cellMap.set(c.id, {
          boardId: c.board_id,
          position: c.position,
          missionTitle: c.missions?.title || '미션'
        })
      }

      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id, cell_id, public_url, uploaded_at, uploaded_by')
        .in('cell_id', cellIds)
        .order('uploaded_at', { ascending: false })
      if (photosError) throw photosError

      const memberIds = [...new Set((photos || []).map((p) => p.uploaded_by).filter(Boolean))]
      let memberMap = new Map<string, string>()
      if (memberIds.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('id, name')
          .in('id', memberIds)
        if (membersError) throw membersError
        memberMap = new Map((members || []).map((m) => [m.id, m.name]))
      }

      const gallery = (photos || [])
        .map((photo) => {
          const cellMeta = cellMap.get(photo.cell_id)
          if (!cellMeta) return null
          const teamMeta = boardMap.get(cellMeta.boardId)
          if (!teamMeta) return null
          return {
            id: photo.id,
            url: photo.public_url,
            uploadedAt: photo.uploaded_at,
            teamId: teamMeta.teamId,
            teamName: teamMeta.teamName,
            missionTitle: cellMeta.missionTitle,
            position: cellMeta.position,
            uploaderName: photo.uploaded_by ? memberMap.get(photo.uploaded_by) || '참가자' : '참가자'
          }
        })
        .filter(Boolean)

      return new Response(
        JSON.stringify({ success: true, photos: gallery }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ─── 관리자: 전체 사진 목록 조회 ───
    if (action === 'get_admin_photos') {
      const { teamId } = data || {}

      let boardsQuery = supabase
        .from('bingo_boards')
        .select('id, team_id, teams (id, name)')
      if (teamId) boardsQuery = boardsQuery.eq('team_id', teamId)
      const { data: boards, error: boardsErr } = await boardsQuery
      if (boardsErr) throw boardsErr
      if (!boards || boards.length === 0) {
        return new Response(JSON.stringify({ success: true, photos: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const boardIds = boards.map((b) => b.id)
      const boardMap = new Map(boards.map((b) => [b.id, { teamId: b.team_id, teamName: b.teams?.name || '' }]))

      const { data: cells, error: cellsErr } = await supabase
        .from('board_cells')
        .select('id, board_id, position, missions (title)')
        .in('board_id', boardIds)
      if (cellsErr) throw cellsErr

      const cellMap = new Map((cells || []).map((c) => [
        c.id,
        { boardId: c.board_id, position: c.position, missionTitle: c.missions?.title || '미션' }
      ]))

      const { data: photos, error: photosErr } = await supabase
        .from('photos')
        .select('id, cell_id, public_url, uploaded_at, uploaded_by')
        .in('cell_id', (cells || []).map((c) => c.id))
        .order('uploaded_at', { ascending: false })
      if (photosErr) throw photosErr

      const memberIds = [...new Set((photos || []).map((p) => p.uploaded_by).filter(Boolean))]
      let memberMap = new Map<string, string>()
      if (memberIds.length > 0) {
        const { data: members } = await supabase
          .from('team_members')
          .select('id, name')
          .in('id', memberIds)
        memberMap = new Map((members || []).map((m) => [m.id, m.name]))
      }

      const result = (photos || []).map((photo) => {
        const cell = cellMap.get(photo.cell_id)
        const board = cell ? boardMap.get(cell.boardId) : null
        return {
          id: photo.id,
          cellId: photo.cell_id,
          url: photo.public_url,
          uploadedAt: photo.uploaded_at,
          teamId: board?.teamId || '',
          teamName: board?.teamName || '',
          missionTitle: cell?.missionTitle || '',
          position: cell?.position || 0,
          uploaderName: photo.uploaded_by ? memberMap.get(photo.uploaded_by) || '참가자' : '참가자',
        }
      })

      return new Response(JSON.stringify({ success: true, photos: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── 관리자: 사진 삭제 (DB 레코드 + Storage 파일) ───
    if (action === 'delete_photo') {
      const { photoId, storagePath } = data

      // DB 레코드 삭제 → 트리거가 자동으로 셀/팀 재계산
      const { error: delErr } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)
      if (delErr) throw delErr

      // Storage 파일 삭제 (URL에서 버킷 이하 경로 추출)
      if (storagePath) {
        const pathMatch = storagePath.match(/mission-photos\/(.+)$/)
        if (pathMatch) {
          await supabase.storage.from('mission-photos').remove([pathMatch[1]])
        }
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── 관리자: 실제 팀 현황 조회 (Admin 대시보드용) ───
    if (action === 'get_admin_teams') {
      const { data: teams, error: teamsErr } = await supabase
        .from('teams')
        .select('id, name, completed_lines, second_line_completed_at')
        .order('created_at')
      if (teamsErr) throw teamsErr

      const { data: boards } = await supabase.from('bingo_boards').select('id, team_id')
      const boardIds = (boards || []).map((b) => b.id)
      const boardToTeam = new Map((boards || []).map((b) => [b.id, b.team_id]))

      let completedMap = new Map<string, number>()
      let totalMap = new Map<string, number>()
      if (boardIds.length > 0) {
        const { data: cells } = await supabase
          .from('board_cells')
          .select('board_id, is_completed')
          .in('board_id', boardIds)
        for (const cell of cells || []) {
          const tid = boardToTeam.get(cell.board_id) || ''
          totalMap.set(tid, (totalMap.get(tid) || 0) + 1)
          if (cell.is_completed) completedMap.set(tid, (completedMap.get(tid) || 0) + 1)
        }
      }

      const { data: members } = await supabase
        .from('team_members')
        .select('team_id, id, name, school, major, cohort, joined_at')
      const membersByTeam = new Map<string, typeof members>()
      for (const m of members || []) {
        if (!membersByTeam.has(m.team_id)) membersByTeam.set(m.team_id, [])
        membersByTeam.get(m.team_id)!.push(m)
      }

      const { data: photoCounts } = await supabase
        .from('photos')
        .select('cell_id')
      const photoByBoard = new Map<string, number>()
      if (boardIds.length > 0 && photoCounts) {
        const { data: cellBoardMap } = await supabase
          .from('board_cells')
          .select('id, board_id')
          .in('board_id', boardIds)
        const cellToBoard = new Map((cellBoardMap || []).map((c) => [c.id, c.board_id]))
        for (const p of photoCounts) {
          const bid = cellToBoard.get(p.cell_id) || ''
          const tid = boardToTeam.get(bid) || ''
          photoByBoard.set(tid, (photoByBoard.get(tid) || 0) + 1)
        }
      }

      const result = sortTeamsByNumber(teams as TeamSummary[]).map((team) => ({
        id: team.id,
        name: team.name,
        completedLines: team.completed_lines || 0,
        completedMissions: completedMap.get(team.id) || 0,
        totalMissions: totalMap.get(team.id) || 0,
        photoCount: photoByBoard.get(team.id) || 0,
        members: (membersByTeam.get(team.id) || []).map((m) => ({
          id: m.id, name: m.name, school: m.school, major: m.major, cohort: m.cohort,
        })),
      }))

      return new Response(JSON.stringify({ success: true, teams: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
